import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { sql, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // メトリクスは期間に関係なく、常に最新の全体状況を表示
    // 比較は前月との比較で固定
    
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // 現在の日付
    const today = formatDate(now);

    // 最新の全体メトリクス（全期間）
    const currentMetrics = await db
      .select({
        // Revenue calculation: sum of paid amounts only (will handle subscription calculation later)
        totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.orderId})`,
        totalCustomers: sql<number>`COUNT(DISTINCT ${orders.customerId})`
      })
      .from(orders);

    // 前月末時点での累積メトリクス（前月末までのcreated_atで集計）
    const upToLastMonthMetrics = await db
      .select({
        // Simplified revenue calculation - sum of paid amounts only for now
        // TODO: Implement subscription calculation properly with DATE_PART once SQL issues are resolved
        totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.orderId})`,
        totalCustomers: sql<number>`COUNT(DISTINCT ${orders.customerId})`
      })
      .from(orders)
      .where(lte(orders.createdAt, new Date(lastMonthEnd)));

    const current = currentMetrics[0];
    const upToLastMonth = upToLastMonthMetrics[0];

    // 増加率と増加数を計算（前月末累積との比較）
    const calculateGrowth = (current: number, previous: number) => {
      const count = current - previous;
      if (previous === 0) {
        return { rate: current > 0 ? 100 : 0, count };
      }
      const rate = ((current - previous) / previous) * 100;
      return { rate, count };
    };

    const currentRevenue = parseFloat(current.totalRevenue);
    const upToLastMonthRevenue = parseFloat(upToLastMonth.totalRevenue);
    const revenueGrowth = calculateGrowth(currentRevenue, upToLastMonthRevenue);

    const ordersGrowth = calculateGrowth(Number(current.totalOrders), Number(upToLastMonth.totalOrders));
    const customersGrowth = calculateGrowth(Number(current.totalCustomers), Number(upToLastMonth.totalCustomers));

    return NextResponse.json({
      metrics: {
        totalRevenue: {
          value: currentRevenue,
          growth: revenueGrowth
        },
        totalOrders: {
          value: Number(current.totalOrders),
          growth: ordersGrowth
        },
        totalCustomers: {
          value: Number(current.totalCustomers),
          growth: customersGrowth
        }
      },
      previousPeriod: {
        totalRevenue: upToLastMonthRevenue,
        totalOrders: Number(upToLastMonth.totalOrders),
        totalCustomers: Number(upToLastMonth.totalCustomers)
      }
    });
  } catch (error) {
    console.error('Dashboard metrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}