import { NextResponse } from 'next/server';
import { getSubscriptionSummaryMetrics } from '@/app/models/subscriptions';

export async function GET() {
  try {
    const summary = await getSubscriptionSummaryMetrics();

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Subscriptions summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions summary' },
      { status: 500 }
    );
  }
}