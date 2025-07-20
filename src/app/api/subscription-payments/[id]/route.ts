import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptionPaid } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paidId } = await params;
    const body = await request.json();
    const { isPaid } = body;

    if (typeof isPaid !== 'boolean') {
      return NextResponse.json(
        { error: 'isPaid must be a boolean' },
        { status: 400 }
      );
    }

    // サブスクリプション支払い状況を更新
    const [updatedPayment] = await db
      .update(subscriptionPaid)
      .set({
        isPaid,
        updatedAt: new Date()
      })
      .where(eq(subscriptionPaid.paidId, paidId))
      .returning();

    if (!updatedPayment) {
      return NextResponse.json(
        { error: 'Subscription payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscriptionPayment: {
        paidId: updatedPayment.paidId,
        subscriptionId: updatedPayment.subscriptionId,
        year: updatedPayment.year,
        month: updatedPayment.month,
        amount: parseFloat(updatedPayment.amount),
        isPaid: updatedPayment.isPaid,
        createdAt: updatedPayment.createdAt ? new Date(updatedPayment.createdAt).toISOString() : null,
        updatedAt: updatedPayment.updatedAt ? new Date(updatedPayment.updatedAt).toISOString() : null,
      }
    });
  } catch (error) {
    console.error('Subscription payment update error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription payment' },
      { status: 500 }
    );
  }
}