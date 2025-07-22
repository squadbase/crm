import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptions, getSubscriptionCount, getSubscriptionPaymentSummary, createSubscription, SubscriptionFilters } from '@/models/subscriptions';
import { db } from '@/lib/db';
import { subscriptionAmounts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // パラメータ取得
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');

    // フィルターオブジェクトを構築
    const filters: SubscriptionFilters = {};
    const offset = (page - 1) * limit;
    
    if (search) {
      filters.search = search;
    }

    // データ取得
    const [subscriptionsData, total] = await Promise.all([
      getSubscriptions({
        filters,
        sort: { field: 'startDate', direction: 'desc' },
        limit,
        offset
      }),
      getSubscriptionCount(filters)
    ]);

    // 各サブスクリプションの詳細情報を取得
    const enrichedSubscriptions = await Promise.all(
      subscriptionsData.map(async (sub) => {
        const paymentSummary = await getSubscriptionPaymentSummary(sub.subscriptionId);
        
        // サブスクリプションの料金履歴を取得して現在の金額と契約終了日を計算
        const amounts = await db
          .select()
          .from(subscriptionAmounts)
          .where(eq(subscriptionAmounts.subscriptionId, sub.subscriptionId))
          .orderBy(desc(subscriptionAmounts.startDate));

        // 現在の日時を取得
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD形式
        
        // 現在の日付で有効な料金を取得（開始日 <= 現在日 <= 終了日 または 終了日がnull）
        const currentAmountRecord = amounts.find(a => {
          const startDate = a.startDate;
          const endDate = a.endDate;
          
          // 開始日が現在日以前で、かつ（終了日がnullまたは終了日が現在日より後）
          return startDate <= today && (!endDate || endDate > today);
        });
        
        const currentAmount = currentAmountRecord ? parseFloat(currentAmountRecord.amount) : 0;
        
        // 最新設定の料金を取得（開始日が最も新しいレコード）
        const latestAmountRecord = amounts.length > 0 ? amounts[0] : null;
        const latestAmount = latestAmountRecord ? parseFloat(latestAmountRecord.amount) : 0;
        
        // 最後に終了した契約があればその終了日を取得
        const lastEndedAmount = amounts.find(a => a.endDate);
        const endDate = lastEndedAmount ? lastEndedAmount.endDate : null;

        // ステータス判定（現在の日付で有効な料金があれば active、なければ inactive）
        const status = currentAmountRecord ? 'active' : 'inactive';

        return {
          ...sub,
          currentAmount: currentAmount,
          latestAmount: latestAmount,
          startDate: sub.startDate ? sub.startDate.toString() : null,
          endDate: endDate ? endDate.toString() : null,
          totalPaid: paymentSummary.paidAmount,
          totalUnpaid: paymentSummary.unpaidAmount,
          totalAmount: paymentSummary.totalAmount, // 支払い合計を別途追加
          status
        };
      })
    );

    const filteredSubscriptions = enrichedSubscriptions;

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
    const subscription = await createSubscription({
      customerId,
      description: description || null
    });

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