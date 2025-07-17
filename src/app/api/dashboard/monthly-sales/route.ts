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

    // 月別売上データを取得（合計、プロジェクト、Squadbase別）
    const monthlySales = await db
      .select({
        month: sql<string>`TO_CHAR(${orders.salesStartDt}, 'YYYY-MM')`,
        totalAmount: sum(orders.amount),
        projectAmount: sql<string>`SUM(CASE WHEN ${orders.serviceType} = 'project' THEN ${orders.amount} ELSE 0 END)`,
        squadbaseAmount: sql<string>`SUM(CASE WHEN ${orders.serviceType} = 'squadbase' THEN ${orders.amount} ELSE 0 END)`,
        orderCount: sql<string>`COUNT(*)`,
        projectCount: sql<string>`COUNT(CASE WHEN ${orders.serviceType} = 'project' THEN 1 END)`,
        squadbaseCount: sql<string>`COUNT(CASE WHEN ${orders.serviceType} = 'squadbase' THEN 1 END)`
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
      squadbaseAmount: parseFloat(item.squadbaseAmount || '0'),
      orderCount: parseInt(item.orderCount || '0'),
      projectCount: parseInt(item.projectCount || '0'),
      squadbaseCount: parseInt(item.squadbaseCount || '0')
    }));

    return NextResponse.json({
      monthlySales: processedData,
      summary: {
        totalPeriodSales: processedData.reduce((sum, item) => sum + item.totalAmount, 0),
        totalProjectSales: processedData.reduce((sum, item) => sum + item.projectAmount, 0),
        totalSquadbaseSales: processedData.reduce((sum, item) => sum + item.squadbaseAmount, 0),
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