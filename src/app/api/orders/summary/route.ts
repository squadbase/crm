import { NextRequest, NextResponse } from 'next/server';
import { getOrdersSummary } from '@/app/models/orders';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salesStartDt = searchParams.get('salesStartDt');
    const salesEndDt = searchParams.get('salesEndDt');

    const summary = await getOrdersSummary(
      salesStartDt || undefined,
      salesEndDt || undefined
    );

    return NextResponse.json({
      summary,
      serviceTypes: [], // 不要になったので空配列
    });
  } catch (error) {
    console.error('Orders summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders summary' },
      { status: 500 }
    );
  }
}