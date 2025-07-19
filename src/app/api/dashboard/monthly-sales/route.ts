import { NextRequest, NextResponse } from 'next/server';
import { getMonthlySalesData } from '@/app/models/dashboard';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;

    const monthlySales = await getMonthlySalesData(startDateObj, endDateObj);

    return NextResponse.json({
      monthlySales: monthlySales.map(item => ({
        month: item.month,
        totalAmount: item.totalSales,
        projectAmount: item.projectSales,
        productAmount: item.productSales,
        orderCount: item.orderCount,
        projectCount: 0, // TODO: Add project count to aggregation query
        productCount: 0  // TODO: Add product count to aggregation query
      })),
      summary: {
        totalPeriodSales: monthlySales.reduce((sum, item) => sum + item.totalSales, 0),
        totalProjectSales: monthlySales.reduce((sum, item) => sum + item.projectSales, 0),
        totalProductSales: monthlySales.reduce((sum, item) => sum + item.productSales, 0),
        totalOrders: monthlySales.reduce((sum, item) => sum + item.orderCount, 0),
        monthCount: monthlySales.length
      }
    });
  } catch (error) {
    console.error('Monthly sales API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly sales data' },
      { status: 500 }
    );
  }
}