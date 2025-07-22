import { NextRequest, NextResponse } from 'next/server';
import { updateSubscriptionAmount, deleteSubscriptionAmount } from '@/models/subscriptions';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: amountId } = await params;
    const body = await request.json();
    const { amount, startDate, endDate } = body;

    const updateData: {
      amount?: string;
      startDate?: string;
      endDate?: string | null;
    } = {};

    if (amount !== undefined) {
      updateData.amount = amount.toString();
    }
    if (startDate !== undefined) {
      updateData.startDate = startDate;
    }
    if (endDate !== undefined) {
      updateData.endDate = endDate;
    }

    // Update subscription pricing
    const updatedAmount = await updateSubscriptionAmount(amountId, updateData);

    if (!updatedAmount) {
      return NextResponse.json(
        { error: 'Subscription amount not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscriptionAmount: updatedAmount
    });
  } catch {
    // Subscription amount update error
    return NextResponse.json(
      { error: 'Failed to update subscription amount' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: amountId } = await params;

    // Delete subscription pricing
    const deletedAmount = await deleteSubscriptionAmount(amountId);

    if (!deletedAmount) {
      return NextResponse.json(
        { error: 'Subscription amount not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Subscription amount deleted successfully',
      deletedAmount
    });
  } catch {
    // Subscription amount deletion error
    return NextResponse.json(
      { error: 'Failed to delete subscription amount' },
      { status: 500 }
    );
  }
}