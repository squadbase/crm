import { NextRequest, NextResponse } from 'next/server';
import { updateSubscriptionPayment } from '@/app/models/subscriptions';

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
    const updatedPayment = await updateSubscriptionPayment(paidId, {
      isPaid
    });

    if (!updatedPayment) {
      return NextResponse.json(
        { error: 'Subscription payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscriptionPayment: updatedPayment
    });
  } catch (error) {
    console.error('Subscription payment update error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription payment' },
      { status: 500 }
    );
  }
}