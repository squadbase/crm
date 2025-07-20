import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';

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

    // 注文と顧客情報を結合して取得（SQLクエリを使用）
    console.log('Fetching order with ID:', orderId);
    
    const query = sql`
      SELECT 
        o.order_id as "orderId",
        o.customer_id as "customerId", 
        c.customer_name as "customerName",
        o.amount,
        o.sales_at as "salesAt",
        o.is_paid as "isPaid",
        o.description,
        o.created_at as "createdAt",
        o.updated_at as "updatedAt"
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.order_id = ${orderId}
      LIMIT 1
    `;

    const orderResult = await db.execute(query);
    console.log('Query result:', orderResult.rows);

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult.rows[0];

    return NextResponse.json({
      order: {
        orderId: order.orderId,
        customerId: order.customerId,
        customerName: order.customerName || "Unknown Customer",
        amount: (order.amount as string | number).toString(),
        salesAt: order.salesAt instanceof Date ? order.salesAt.toISOString() : order.salesAt,
        isPaid: order.isPaid,
        description: order.description,
        createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
        updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to fetch order details', details: error instanceof Error ? error.message : 'Unknown error' },
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
        amount: body.amount,
        isPaid: body.isPaid,
        description: body.description,
        updatedAt: new Date(),
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