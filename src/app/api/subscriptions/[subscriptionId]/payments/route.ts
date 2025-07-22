import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionPayments } from '@/models/subscriptions';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params;

    // Get subscription payment history
    const payments = await getSubscriptionPayments(subscriptionId);

    return NextResponse.json({
      payments
    });
  } catch {
    // Subscription payments API error
    return NextResponse.json(
      { error: 'Failed to fetch subscription payments' },
      { status: 500 }
    );
  }
}