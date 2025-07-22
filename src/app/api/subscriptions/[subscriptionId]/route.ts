import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionWithPaymentDetails } from '@/models/subscriptions';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params;
    // Fetching subscription detail for ID

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const subscriptionDetails = await getSubscriptionWithPaymentDetails(subscriptionId);

    if (!subscriptionDetails) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subscriptionDetails);
  } catch (error) {
    // Subscription detail API error
    return NextResponse.json(
      { error: 'Failed to fetch subscription details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}