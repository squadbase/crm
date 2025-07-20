import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptionPaid } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params;

    // サブスクリプション支払い履歴を取得
    const payments = await db
      .select({
        paidId: subscriptionPaid.paidId,
        subscriptionId: subscriptionPaid.subscriptionId,
        year: subscriptionPaid.year,
        month: subscriptionPaid.month,
        amount: subscriptionPaid.amount,
        isPaid: subscriptionPaid.isPaid,
        createdAt: subscriptionPaid.createdAt,
        updatedAt: subscriptionPaid.updatedAt,
      })
      .from(subscriptionPaid)
      .where(eq(subscriptionPaid.subscriptionId, subscriptionId))
      .orderBy(desc(subscriptionPaid.year), desc(subscriptionPaid.month));

    return NextResponse.json({
      payments: payments.map(payment => ({
        ...payment,
        amount: parseFloat(payment.amount)
      }))
    });
  } catch (error) {
    console.error('Subscription payments API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription payments' },
      { status: 500 }
    );
  }
}