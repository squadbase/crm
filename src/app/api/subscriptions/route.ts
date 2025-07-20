import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptions, customers, subscriptionPaid, subscriptionAmounts } from '@/lib/db/schema';
import { eq, desc, like, and, or, sql, isNull } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // パラメータ取得
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');

    // サブスクリプション一覧を取得（顧客情報と現在の料金、支払い状況を含む）
    let query = db
      .select({
        subscriptionId: subscriptions.subscriptionId,
        customerId: subscriptions.customerId,
        customerName: customers.customerName,
        description: subscriptions.description,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
      })
      .from(subscriptions)
      .leftJoin(customers, eq(subscriptions.customerId, customers.customerId));

    // ソートとページネーション
    const offset = (page - 1) * limit;

    // フィルター適用
    if (search) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (db as any)
        .select({
          subscriptionId: subscriptions.subscriptionId,
          customerId: subscriptions.customerId,
          customerName: customers.customerName,
          description: subscriptions.description,
          createdAt: subscriptions.createdAt,
          updatedAt: subscriptions.updatedAt,
        })
        .from(subscriptions)
        .leftJoin(customers, eq(subscriptions.customerId, customers.customerId))
        .where(
          or(
            like(customers.customerName, `%${search}%`),
            like(subscriptions.description, `%${search}%`)
          )
        )
        .orderBy(desc(subscriptions.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any)
        .orderBy(desc(subscriptions.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const subscriptionsData = await query;

    // 各サブスクリプションの詳細情報を取得
    const enrichedSubscriptions = await Promise.all(
      subscriptionsData.map(async (sub) => {
        // 現在の料金を取得（最新の有効な料金）
        const currentAmountResult = await db
          .select({ 
            amount: subscriptionAmounts.amount,
            startDate: subscriptionAmounts.startDate,
            endDate: subscriptionAmounts.endDate
          })
          .from(subscriptionAmounts)
          .where(
            and(
              eq(subscriptionAmounts.subscriptionId, sub.subscriptionId),
              or(
                isNull(subscriptionAmounts.endDate), // 終了日がnull（継続中）
                sql`${subscriptionAmounts.endDate} >= CURRENT_DATE` // または終了日が今日以降
              )
            )
          )
          .orderBy(desc(subscriptionAmounts.startDate))
          .limit(1);

        // 支払い状況の集計
        const paymentSummary = await db
          .select({
            totalPaid: sql<string>`SUM(CASE WHEN ${subscriptionPaid.isPaid} = true THEN ${subscriptionPaid.amount} ELSE 0 END)`,
            totalUnpaid: sql<string>`SUM(CASE WHEN ${subscriptionPaid.isPaid} = false THEN ${subscriptionPaid.amount} ELSE 0 END)`,
          })
          .from(subscriptionPaid)
          .where(eq(subscriptionPaid.subscriptionId, sub.subscriptionId));

        const currentAmount = currentAmountResult[0]?.amount || 0;
        const startDate = currentAmountResult[0]?.startDate || null;
        const endDate = currentAmountResult[0]?.endDate || null;
        const totalPaid = parseFloat(paymentSummary[0]?.totalPaid || '0');
        const totalUnpaid = parseFloat(paymentSummary[0]?.totalUnpaid || '0');

        // ステータス判定（現在の料金があればアクティブ）
        const status = parseFloat(currentAmount.toString()) > 0 ? 'active' : 'inactive';

        return {
          ...sub,
          currentAmount: parseFloat(currentAmount.toString()),
          startDate: startDate ? startDate.toString() : null,
          endDate: endDate ? endDate.toString() : null,
          totalPaid,
          totalUnpaid,
          status
        };
      })
    );

    // フィルター済みのサブスクリプション（ステータスフィルターは削除）
    const filteredSubscriptions = enrichedSubscriptions;

    // 総数を取得
    let totalCountQuery = db
      .select({ count: sql`count(*)` })
      .from(subscriptions)
      .leftJoin(customers, eq(subscriptions.customerId, customers.customerId));

    if (search) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalCountQuery = (totalCountQuery as any).where(
        or(
          like(customers.customerName, `%${search}%`),
          like(subscriptions.description, `%${search}%`)
        )
      );
    }

    const totalResult = await totalCountQuery;
    const total = parseInt(totalResult[0]?.count?.toString() || '0');

    return NextResponse.json({
      subscriptions: filteredSubscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Subscriptions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, description } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // サブスクリプションを作成
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        customerId,
        description: description || null
      })
      .returning();

    return NextResponse.json({
      subscription: {
        subscriptionId: subscription.subscriptionId,
        customerId: subscription.customerId,
        description: subscription.description,
        createdAt: subscription.createdAt ? new Date(subscription.createdAt).toISOString() : null,
        updatedAt: subscription.updatedAt ? new Date(subscription.updatedAt).toISOString() : null,
      }
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}