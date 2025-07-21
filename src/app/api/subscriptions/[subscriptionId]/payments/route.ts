import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionPayments } from '@/models/subscriptions';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params;

    // サブスクリプション支払い履歴を取得
    const payments = await getSubscriptionPayments(subscriptionId);

    return NextResponse.json({
      payments
    });
  } catch (error) {
    console.error('Subscription payments API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription payments' },
      { status: 500 }
    );
  }
}