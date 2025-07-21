import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionAmounts } from '@/models/subscriptions';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params;

    // サブスクリプション料金履歴を取得
    const amounts = await getSubscriptionAmounts(subscriptionId);

    return NextResponse.json({
      amounts
    });
  } catch (error) {
    console.error('Subscription amounts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription amounts' },
      { status: 500 }
    );
  }
}