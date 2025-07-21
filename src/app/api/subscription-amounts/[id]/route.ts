import { NextRequest, NextResponse } from 'next/server';
import { updateSubscriptionAmount } from '@/app/models/subscriptions';

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
    const updatedAmount = await updateSubscriptionAmount(amountId, {
      endDate
    });

    if (!updatedAmount) {
      return NextResponse.json(
        { error: 'Subscription amount not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscriptionAmount: updatedAmount
    });
  } catch (error) {
    console.error('Subscription amount update error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription amount' },
      { status: 500 }
    );
  }
}