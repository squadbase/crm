import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptionAmounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: amountId } = await params;
    const body = await request.json();
    const { endDate } = body;

    if (!endDate) {
      return NextResponse.json(
        { error: 'End date is required' },
        { status: 400 }
      );
    }

    // サブスクリプション料金を更新（終了日を設定）
    const [updatedAmount] = await db
      .update(subscriptionAmounts)
      .set({
        endDate,
        updatedAt: new Date()
      })
      .where(eq(subscriptionAmounts.amountId, amountId))
      .returning();

    if (!updatedAmount) {
      return NextResponse.json(
        { error: 'Subscription amount not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscriptionAmount: {
        amountId: updatedAmount.amountId,
        subscriptionId: updatedAmount.subscriptionId,
        amount: parseFloat(updatedAmount.amount),
        startDate: updatedAmount.startDate,
        endDate: updatedAmount.endDate,
        createdAt: updatedAmount.createdAt ? new Date(updatedAmount.createdAt).toISOString() : null,
        updatedAt: updatedAmount.updatedAt ? new Date(updatedAmount.updatedAt).toISOString() : null,
      }
    });
  } catch (error) {
    console.error('Subscription amount update error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription amount' },
      { status: 500 }
    );
  }
}