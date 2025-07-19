import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, customers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // 注文詳細を顧客情報と一緒に取得
    const orderDetails = await db
      .select({
        orderId: orders.orderId,
        customerId: orders.customerId,
        customerName: customers.customerName,
        paymentType: orders.paymentType,
        serviceType: orders.serviceType,
        salesStartDt: orders.salesStartDt,
        salesEndDt: orders.salesEndDt,
        amount: orders.amount,
        isPaid: orders.isPaid,
        description: orders.description,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.customerId))
      .where(eq(orders.orderId, orderId))
      .limit(1);

    if (orderDetails.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderDetails[0];

    return NextResponse.json({
      order: {
        orderId: order.orderId,
        customerId: order.customerId,
        customerName: order.customerName,
        paymentType: order.paymentType,
        serviceType: order.serviceType,
        salesStartDt: order.salesStartDt,
        salesEndDt: order.salesEndDt,
        amount: order.amount.toString(),
        isPaid: order.isPaid,
        description: order.description,
        createdAt: order.createdAt?.toISOString(),
        updatedAt: order.updatedAt?.toISOString(),
      }
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}

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