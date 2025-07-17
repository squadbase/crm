import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { sum, count, sql, gte, lte, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salesStartDt = searchParams.get('salesStartDt');
    const salesEndDt = searchParams.get('salesEndDt');

    // WHERE条件を構築
    const conditions = [];
    if (salesStartDt) {
      conditions.push(gte(orders.salesStartDt, salesStartDt));
    }
    if (salesEndDt) {
      conditions.push(lte(orders.salesStartDt, salesEndDt));
    }

    // 総合集計
    const totalSummary = await db
      .select({
        totalOrders: count(),
        totalAmount: sum(orders.amount),
        paidAmount: sql<string>`SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END)`,
        unpaidAmount: sql<string>`SUM(CASE WHEN ${orders.isPaid} = false THEN ${orders.amount} ELSE 0 END)`,
      })
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // サービス種別ごとの集計
    const serviceTypeSummary = await db
      .select({
        serviceType: orders.serviceType,
        count: count(),
        totalAmount: sum(orders.amount),
      })
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(orders.serviceType);


    return NextResponse.json({
      summary: totalSummary[0],
      serviceTypes: serviceTypeSummary,
    });
  } catch (error) {
    console.error('Orders summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders summary' },
      { status: 500 }
    );
  }
}