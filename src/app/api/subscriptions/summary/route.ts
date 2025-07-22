import { NextResponse } from 'next/server';
import { getSubscriptionSummaryMetrics } from '@/models/subscriptions';

export async function GET() {
  try {
    const summary = await getSubscriptionSummaryMetrics();

    return NextResponse.json(summary);
  } catch {
    // Subscriptions summary API error
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions summary' },
      { status: 500 }
    );
  }
}