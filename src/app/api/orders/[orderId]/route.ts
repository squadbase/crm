import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();

    const updatedOrder = await db
      .update(orders)
      .set({
        customerId: body.customerId,
        paymentType: body.paymentType,
        serviceType: body.serviceType,
        salesStartDt: body.salesStartDt,
        salesEndDt: body.salesEndDt,
        amount: body.amount,
        isPaid: body.isPaid,
        description: body.description,
      })
      .where(eq(orders.orderId, orderId))
      .returning();

    if (updatedOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOrder[0]);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const deletedOrder = await db
      .delete(orders)
      .where(eq(orders.orderId, orderId))
      .returning();

    if (deletedOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();

    if (body.action === 'update-payment-status') {
      const updatedOrder = await db
        .update(orders)
        .set({
          isPaid: body.isPaid,
        })
        .where(eq(orders.orderId, orderId))
        .returning();

      if (updatedOrder.length === 0) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedOrder[0]);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Patch order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}