import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customers, orders } from '@/lib/db/schema';
import { eq, ilike, count, sql, desc, asc } from 'drizzle-orm';
import { z } from 'zod';

const createCustomerSchema = z.object({
  customer_name: z.string()
    .min(1, "顧客名は必須です")
    .max(255, "顧客名は255文字以内で入力してください")
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

    const whereClause = search ? ilike(customers.customerName, `%${search}%`) : undefined;

    const [customerList, totalCountResult] = await Promise.all([
      db.select({
        customerId: customers.customerId,
        customerName: customers.customerName,
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
        orderCount: sql<number>`COALESCE(COUNT(${orders.orderId}), 0)`,
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
        lastOrderDate: sql<string>`MAX(${orders.createdAt})`
      })
        .from(customers)
        .leftJoin(orders, eq(customers.customerId, orders.customerId))
        .where(whereClause)
        .groupBy(customers.customerId, customers.customerName, customers.createdAt, customers.updatedAt)
        .orderBy(
          sort === 'revenue' 
            ? direction === 'desc' 
              ? desc(sql<number>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`)
              : asc(sql<number>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`)
            : direction === 'desc'
              ? desc(customers.createdAt)
              : asc(customers.createdAt)
        )
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(customers)
        .where(whereClause)
    ]);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      customers: customerList,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
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

    const newCustomer = await db
      .insert(customers)
      .values({
        customerName: validatedData.customer_name,
      })
      .returning();

    return NextResponse.json(newCustomer[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}