import { NextRequest, NextResponse } from 'next/server';
import { createSubscriptionAmount } from '@/models/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, amount, startDate, endDate } = body;

    if (!subscriptionId || !amount || !startDate) {
      return NextResponse.json(
        { error: 'Subscription ID, amount, and start date are required' },
        { status: 400 }
      );
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Create subscription pricing
    const subscriptionAmount = await createSubscriptionAmount({
      subscriptionId,
      amount: amount.toString(),
      startDate,
      endDate: endDate || null
    });

    return NextResponse.json({
      subscriptionAmount
    });
  } catch {
    // Subscription amount creation error
    return NextResponse.json(
      { error: 'Failed to create subscription amount' },
      { status: 500 }
    );
  }
}