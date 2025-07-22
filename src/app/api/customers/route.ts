import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, getCustomerCount, createCustomer } from '@/models/customers';
import { z } from 'zod';

const createCustomerSchema = z.object({
  customer_name: z.string()
    .min(1, "Customer name is required")
    .max(255, "Customer name must be within 255 characters")
    .trim()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'created';
    const direction = searchParams.get('direction') || 'desc';
    const offset = (page - 1) * limit;

    // Build filters - ensure filters is always a valid object
    const filters = {};
    if (search && search.trim() !== '') {
      Object.assign(filters, { search: search.trim() });
    }

    // Set sort configuration
    const sortField = sort === 'revenue' ? 'revenue' :
                     sort === 'orders' ? 'orders' :
                     sort === 'name' ? 'name' :
                     'created';
    
    const sortOptions = {
      field: sortField as 'name' | 'revenue' | 'orders' | 'created',
      direction: direction as 'asc' | 'desc'
    };

    // Fetching customers with filters and sort options

    let customerList, totalCount;
    try {
      // Calling getCustomers
      customerList = await getCustomers({
        filters,
        sort: sortOptions,
        limit,
        offset
      });
      // getCustomers completed successfully
    } catch (error) {
      // Error in getCustomers
      throw error;
    }

    try {
      // Calling getCustomerCount
      totalCount = await getCustomerCount(filters);
      // getCustomerCount completed successfully
    } catch (error) {
      // Error in getCustomerCount
      throw error;
    }

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      customers: customerList.map(customer => ({
        customerId: customer.customerId,
        customerName: customer.customerName,
        createdAt: customer.createdAt,
        updatedAt: customer.createdAt, // Using createdAt as fallback
        orderCount: customer.orderCount,
        totalRevenue: customer.totalRevenue,
        lastOrderDate: customer.createdAt // Using createdAt as fallback
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    });
  } catch {
    // Error fetching customers
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCustomerSchema.parse(body);

    // Create the customer
    const newCustomer = await createCustomer({
      customerName: validatedData.customer_name
    });

    if (!newCustomer) {
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      customer: {
        customerId: newCustomer.customerId,
        customerName: newCustomer.customerName,
        createdAt: newCustomer.createdAt,
        updatedAt: newCustomer.updatedAt
      }
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    
    // Error creating customer
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}