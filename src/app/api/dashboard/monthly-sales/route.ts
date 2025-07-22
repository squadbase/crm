import { NextRequest, NextResponse } from 'next/server';
import { getMonthlySalesData } from '@/models/dashboard';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const monthlySales = await getMonthlySalesData(startDate, endDate);

    return NextResponse.json({
      monthlySales: monthlySales.map(item => ({
        month: item.month,
        totalAmount: item.totalSales,
        onetimeAmount: item.onetimeSales,
        subscriptionAmount: item.subscriptionSales,
        year: item.year,
        monthNum: item.monthNum
      })),
      summary: {
        totalPeriodSales: monthlySales.reduce((sum, item) => sum + item.totalSales, 0),
        totalOnetimeSales: monthlySales.reduce((sum, item) => sum + item.onetimeSales, 0),
        totalSubscriptionSales: monthlySales.reduce((sum, item) => sum + item.totalSales - item.onetimeSales, 0),
        monthCount: monthlySales.length
      }
    });
  } catch {
    // Monthly sales API error
    return NextResponse.json(
      { error: 'Failed to fetch monthly sales data' },
      { status: 500 }
    );
  }
}