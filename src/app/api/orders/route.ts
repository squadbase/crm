import { NextRequest, NextResponse } from 'next/server';
import { getOrders, getOrderCount, createOrder, OrderFilters } from '@/app/models/orders';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // パラメータ取得
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const isPaid = searchParams.get('isPaid');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    // フィルターオブジェクトを構築
    const filters: OrderFilters = {};
    const offset = (page - 1) * limit;
    
    if (isPaid !== null && isPaid !== '') {
      filters.isPaid = isPaid === 'true';
    }
    
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    
    if (endDate) {
      filters.endDate = new Date(endDate + ' 23:59:59');
    }
    
    if (search) {
      filters.search = search;
    }

    // データ取得
    const [orders, totalCount] = await Promise.all([
      getOrders({
        filters,
        sort: { field: 'created', direction: 'desc' },
        limit,
        offset
      }),
      getOrderCount(filters)
    ]);
    
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
    
    // 基本的なバリデーション
    if (!body.customerId || !body.amount || !body.salesAt) {
      return NextResponse.json(
        { error: 'customerId, amount, and salesAt are required' },
        { status: 400 }
      );
    }

    // 金額の数値チェック
    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number' },
        { status: 400 }
      );
    }

    // 日付の有効性チェック
    const salesDate = new Date(body.salesAt);
    if (isNaN(salesDate.getTime())) {
      return NextResponse.json(
        { error: 'salesAt must be a valid date' },
        { status: 400 }
      );
    }
    
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