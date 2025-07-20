import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptionAmounts } from '@/lib/db/schema';

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

    // サブスクリプション料金を作成
    const [subscriptionAmount] = await db
      .insert(subscriptionAmounts)
      .values({
        subscriptionId,
        amount: amount.toString(),
        startDate,
        endDate: endDate || null
      })
      .returning();

    return NextResponse.json({
      subscriptionAmount: {
        amountId: subscriptionAmount.amountId,
        subscriptionId: subscriptionAmount.subscriptionId,
        amount: parseFloat(subscriptionAmount.amount),
        startDate: subscriptionAmount.startDate,
        endDate: subscriptionAmount.endDate,
        createdAt: subscriptionAmount.createdAt ? new Date(subscriptionAmount.createdAt).toISOString() : null,
        updatedAt: subscriptionAmount.updatedAt ? new Date(subscriptionAmount.updatedAt).toISOString() : null,
      }
    });
  } catch (error) {
    console.error('Subscription amount creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription amount' },
      { status: 500 }
    );
  }
}