import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { sum, sql, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // WHERE条件を構築
    const conditions = [];
    if (startDate) {
      conditions.push(gte(orders.salesStartDt, startDate));
    }
    if (endDate) {
      conditions.push(lte(orders.salesStartDt, endDate));
    }

    // 月別売上データを取得（合計、プロジェクト、Product別）
    const monthlySales = await db
      .select({
        month: sql<string>`TO_CHAR(${orders.salesStartDt}, 'YYYY-MM')`,
        totalAmount: sum(orders.amount),
        projectAmount: sql<string>`SUM(CASE WHEN ${orders.serviceType} = 'project' THEN ${orders.amount} ELSE 0 END)`,
        productAmount: sql<string>`SUM(CASE WHEN ${orders.serviceType} = 'product' THEN ${orders.amount} ELSE 0 END)`,
        orderCount: sql<string>`COUNT(*)`,
        projectCount: sql<string>`COUNT(CASE WHEN ${orders.serviceType} = 'project' THEN 1 END)`,
        productCount: sql<string>`COUNT(CASE WHEN ${orders.serviceType} = 'product' THEN 1 END)`
      })
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(sql`TO_CHAR(${orders.salesStartDt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${orders.salesStartDt}, 'YYYY-MM') ASC`);

    // 0の値を数値に変換し、月のデータを整理
    const processedData = monthlySales.map(item => ({
      month: item.month,
      totalAmount: parseFloat(item.totalAmount || '0'),
      projectAmount: parseFloat(item.projectAmount || '0'),
      productAmount: parseFloat(item.productAmount || '0'),
      orderCount: parseInt(item.orderCount || '0'),
      projectCount: parseInt(item.projectCount || '0'),
      productCount: parseInt(item.productCount || '0')
    }));

    return NextResponse.json({
      monthlySales: processedData,
      summary: {
        totalPeriodSales: processedData.reduce((sum, item) => sum + item.totalAmount, 0),
        totalProjectSales: processedData.reduce((sum, item) => sum + item.projectAmount, 0),
        totalProductSales: processedData.reduce((sum, item) => sum + item.productAmount, 0),
        totalOrders: processedData.reduce((sum, item) => sum + item.orderCount, 0),
        monthCount: processedData.length
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