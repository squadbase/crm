import { NextRequest, NextResponse } from 'next/server';
import { getOrders, getOrderCount, createOrder } from '@/app/models/orders';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // パラメータ取得
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sort = searchParams.get('sort') || 'created';
    const direction = searchParams.get('direction') || 'desc';
    const paymentType = searchParams.get('paymentType') as 'onetime' | 'subscription' | undefined;
    const serviceType = searchParams.get('serviceType') as 'product' | 'project' | undefined;
    const isPaid = searchParams.get('isPaid');
    const salesStartDt = searchParams.get('salesStartDt');
    const salesEndDt = searchParams.get('salesEndDt');
    const search = searchParams.get('search');

    // フィルター構築
    const filters = {
      ...(paymentType && { paymentType }),
      ...(serviceType && { serviceType }),
      ...(isPaid !== null && isPaid !== '' && { isPaid: isPaid === 'true' }),
      ...(salesStartDt && { startDate: new Date(salesStartDt) }),
      ...(salesEndDt && { endDate: new Date(salesEndDt) }),
      ...(search && { search })
    };

    // ソート設定
    const sortField = sort === 'created' ? 'created' :
                     sort === 'amount' ? 'amount' :
                     sort === 'customer' ? 'customer' :
                     'payment';
    
    const sortOptions = {
      field: sortField as 'created' | 'amount' | 'customer' | 'payment',
      direction: direction as 'asc' | 'desc'
    };

    // データ取得
    const offset = (page - 1) * limit;
    
    const [ordersData, totalCount] = await Promise.all([
      getOrders({
        filters,
        sort: sortOptions,
        limit,
        offset
      }),
      getOrderCount(filters)
    ]);

    return NextResponse.json({
      orders: ordersData,
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
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newOrder = await createOrder({
      customerId: body.customerId,
      customerName: body.customerName, // Required by schema
      paymentType: body.paymentType,
      serviceType: body.serviceType,
      salesStartDt: body.salesStartDt,
      salesEndDt: body.salesEndDt,
      amount: body.amount,
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