import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptions, getSubscriptionCount, getSubscriptionPaymentSummary, createSubscription, SubscriptionFilters } from '@/app/models/subscriptions';

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

        // ステータス判定（未払いがあれば inactive、なければ active）
        const status = paymentSummary.unpaidAmount > 0 ? 'inactive' : 'active';

        return {
          ...sub,
          currentAmount: paymentSummary.totalAmount,
          startDate: sub.startDate ? sub.startDate.toString() : null,
          totalPaid: paymentSummary.paidAmount,
          totalUnpaid: paymentSummary.unpaidAmount,
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