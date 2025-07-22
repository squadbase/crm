import { NextRequest, NextResponse } from 'next/server';
import { getOrderWithCustomerDetails, updateOrder, deleteOrder } from '@/models/orders';

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

    const order = await getOrderWithCustomerDetails(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: {
        orderId: order.orderId,
        customerId: order.customerId,
        customerName: order.customerName || "Unknown Customer",
        amount: order.amount.toString(),
        salesAt: order.salesAt instanceof Date ? order.salesAt.toISOString() : order.salesAt,
        isPaid: order.isPaid,
        description: order.description,
        createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
        updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
      }
    });
  } catch (error) {
    // Error fetching order details
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

    const updatedOrder = await updateOrder(orderId, {
      customerId: body.customerId,
      amount: body.amount,
      isPaid: body.isPaid,
      description: body.description,
    });

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOrder);
  } catch {
    // Update order error
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

    const deletedOrder = await deleteOrder(orderId);

    if (!deletedOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    // Delete order error
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
      const updatedOrder = await updateOrder(orderId, {
        isPaid: body.isPaid,
      });

      if (!updatedOrder) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedOrder);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch {
    // Patch order error
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}