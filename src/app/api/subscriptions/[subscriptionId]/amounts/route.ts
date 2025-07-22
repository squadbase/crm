import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionAmounts } from '@/models/subscriptions';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params;

    // Get subscription pricing history
    const amounts = await getSubscriptionAmounts(subscriptionId);

    return NextResponse.json({
      amounts
    });
  } catch {
    // Subscription amounts API error
    return NextResponse.json(
      { error: 'Failed to fetch subscription amounts' },
      { status: 500 }
    );
  }
}