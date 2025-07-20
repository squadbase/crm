import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptionAmounts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params;

    // サブスクリプション料金履歴を取得
    const amounts = await db
      .select({
        amountId: subscriptionAmounts.amountId,
        subscriptionId: subscriptionAmounts.subscriptionId,
        amount: subscriptionAmounts.amount,
        startDate: subscriptionAmounts.startDate,
        endDate: subscriptionAmounts.endDate,
        createdAt: subscriptionAmounts.createdAt,
        updatedAt: subscriptionAmounts.updatedAt,
      })
      .from(subscriptionAmounts)
      .where(eq(subscriptionAmounts.subscriptionId, subscriptionId))
      .orderBy(desc(subscriptionAmounts.startDate));

    return NextResponse.json({
      amounts: amounts.map(amount => ({
        ...amount,
        amount: parseFloat(amount.amount)
      }))
    });
  } catch (error) {
    console.error('Subscription amounts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription amounts' },
      { status: 500 }
    );
  }
}