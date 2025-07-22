import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCustomerDetails, updateCustomer, deleteCustomer } from '@/models/customers';

const updateCustomerSchema = z.object({
  customer_name: z.string()
    .min(1, "Customer name is required")
    .max(255, "Customer name must be within 255 characters")
    .trim()
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    const customerData = await getCustomerDetails(customerId);

    if (!customerData) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(customerData);
  } catch {
    // Error fetching customer
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

    const updatedCustomer = await updateCustomer(customerId, {
      customerName: validatedData.customer_name
    });

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    
    // Error updating customer
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    const deletedCustomer = await deleteCustomer(customerId);

    if (!deletedCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    // Error deleting customer
    if (error instanceof Error && error.message === 'Cannot delete customer with existing orders') {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing orders' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}