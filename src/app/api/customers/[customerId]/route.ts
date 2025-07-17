import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customers, orders } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const updateCustomerSchema = z.object({
  customer_name: z.string()
    .min(1, "顧客名は必須です")
    .max(255, "顧客名は255文字以内で入力してください")
    .trim()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    // Get customer basic info
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.customerId, customerId))
      .limit(1);

    if (customer.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get customer's orders
    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));

    // Calculate stats
    const totalOrders = customerOrders.length;
    const totalRevenue = customerOrders
      .filter(order => order.isPaid)
      .reduce((sum, order) => sum + parseFloat(order.amount), 0);
    const unpaidOrders = customerOrders.filter(order => !order.isPaid).length;

    return NextResponse.json({
      customer: customer[0],
      orders: customerOrders,
      stats: {
        totalOrders,
        totalRevenue,
        unpaidOrders,
        paidOrders: totalOrders - unpaidOrders
      }
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const body = await request.json();
    const validatedData = updateCustomerSchema.parse(body);

    const updatedCustomer = await db
      .update(customers)
      .set({
        customerName: validatedData.customer_name,
        updatedAt: new Date(),
      })
      .where(eq(customers.customerId, customerId))
      .returning();

    if (updatedCustomer.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCustomer[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    // Check if customer has orders
    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .limit(1);

    if (customerOrders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing orders' },
        { status: 400 }
      );
    }

    const deletedCustomer = await db
      .delete(customers)
      .where(eq(customers.customerId, customerId))
      .returning();

    if (deletedCustomer.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}