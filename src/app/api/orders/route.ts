import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { createOrder } from '@/app/models/orders';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // パラメータ取得
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sort = searchParams.get('sort') || 'created';
    const direction = searchParams.get('direction') || 'desc';
    const isPaid = searchParams.get('isPaid');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    // データ取得
    const offset = (page - 1) * limit;
    
    // 基本クエリを構築（シンプルなアプローチに変更）
    let baseQuery = sql`
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
    `;

    let countQuery = sql`
      SELECT COUNT(*) as count
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
    `;

    // フィルター条件を追加
    if (isPaid !== null && isPaid !== '') {
      const paidCondition = sql` AND o.is_paid = ${isPaid === 'true'}`;
      baseQuery = sql`${baseQuery} WHERE o.is_paid = ${isPaid === 'true'}`;
      countQuery = sql`${countQuery} WHERE o.is_paid = ${isPaid === 'true'}`;
    }
    
    if (startDate) {
      const hasWhere = isPaid !== null && isPaid !== '';
      const connector = hasWhere ? sql` AND` : sql` WHERE`;
      baseQuery = sql`${baseQuery}${connector} o.sales_at >= ${startDate}`;
      countQuery = sql`${countQuery}${connector} o.sales_at >= ${startDate}`;
    }
    
    if (endDate) {
      const hasWhere = isPaid !== null && isPaid !== '' || startDate;
      const connector = hasWhere ? sql` AND` : sql` WHERE`;
      const endDateTime = endDate + ' 23:59:59';
      baseQuery = sql`${baseQuery}${connector} o.sales_at <= ${endDateTime}`;
      countQuery = sql`${countQuery}${connector} o.sales_at <= ${endDateTime}`;
    }
    
    if (search) {
      const hasWhere = isPaid !== null && isPaid !== '' || startDate || endDate;
      const connector = hasWhere ? sql` AND` : sql` WHERE`;
      const searchPattern = `%${search}%`;
      baseQuery = sql`${baseQuery}${connector} (c.customer_name ILIKE ${searchPattern} OR o.description ILIKE ${searchPattern})`;
      countQuery = sql`${countQuery}${connector} (c.customer_name ILIKE ${searchPattern} OR o.description ILIKE ${searchPattern})`;
    }

    // ORDER BY と LIMIT/OFFSET を追加
    baseQuery = sql`${baseQuery} ORDER BY o.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    
    const [ordersResult, countResult] = await Promise.all([
      db.execute(baseQuery),
      db.execute(countQuery)
    ]);

    const orders = ordersResult.rows;
    const totalCount = parseInt((countResult.rows[0]?.count as string) || '0');
    
    console.log('Orders fetched:', orders.length);
    console.log('Total count:', totalCount);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newOrder = await createOrder({
      customerId: body.customerId,
      amount: body.amount,
      salesAt: body.salesAt,
      isPaid: body.isPaid || false,
      description: body.description,
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}