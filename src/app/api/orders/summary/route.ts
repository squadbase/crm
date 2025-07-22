import { NextRequest, NextResponse } from 'next/server';
import { getOrdersSummary } from '@/models/orders';

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
      serviceTypes: [], // Empty array as service types are no longer needed
    });
  } catch {
    // Orders summary API error
    return NextResponse.json(
      { error: 'Failed to fetch orders summary' },
      { status: 500 }
    );
  }
}