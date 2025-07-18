import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, customers } from '@/lib/db/schema';
import { desc, count, asc, ilike, and, eq, gte, lte, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // パラメータ取得
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    // const sortBy = searchParams.get('sortBy') || 'created_at'; // Currently not used
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const paymentType = searchParams.get('paymentType');
    const serviceType = searchParams.get('serviceType');
    const isPaid = searchParams.get('isPaid');
    const salesStartDt = searchParams.get('salesStartDt');
    const salesEndDt = searchParams.get('salesEndDt');
    const search = searchParams.get('search');

    // WHERE条件を構築
    const conditions = [];
    
    if (paymentType && (paymentType === 'onetime' || paymentType === 'subscription')) {
      conditions.push(eq(orders.paymentType, paymentType));
    }
    
    if (serviceType && (serviceType === 'squadbase' || serviceType === 'project')) {
      conditions.push(eq(orders.serviceType, serviceType));
    }
    
    if (isPaid !== null && isPaid !== '') {
      conditions.push(eq(orders.isPaid, isPaid === 'true'));
    }
    
    if (salesStartDt) {
      conditions.push(gte(orders.salesStartDt, salesStartDt));
    }
    
    if (salesEndDt) {
      conditions.push(lte(orders.salesStartDt, salesEndDt));
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(customers.customerName, `%${search}%`),
          ilike(orders.description, `%${search}%`)
        )
      );
    }

    // データ取得
    const offset = (page - 1) * limit;
    const orderClause = sortOrder === 'desc' ? desc(orders.createdAt) : asc(orders.createdAt);

    const [ordersData, totalCount] = await Promise.all([
      db
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
        .innerJoin(customers, eq(orders.customerId, customers.customerId))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderClause)
        .limit(limit)
        .offset(offset),
      
      db
        .select({ count: count() })
        .from(orders)
        .innerJoin(customers, eq(orders.customerId, customers.customerId))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
    ]);

    return NextResponse.json({
      orders: ordersData,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newOrder = await db.insert(orders).values({
      customerId: body.customerId,
      paymentType: body.paymentType,
      serviceType: body.serviceType,
      salesStartDt: body.salesStartDt,
      salesEndDt: body.salesEndDt,
      amount: body.amount,
      isPaid: body.isPaid || false,
      description: body.description,
    }).returning();

    return NextResponse.json(newOrder[0], { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}