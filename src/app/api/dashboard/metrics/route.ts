import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { sql, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // データベースの日付範囲を一度だけ取得
    const dateRangeResult = !startDate || !endDate ? await db
      .select({
        minDate: sql<string>`MIN(${orders.salesStartDt})`,
        maxDate: sql<string>`MAX(${orders.salesStartDt})`
      })
      .from(orders) : null;

    // 比較期間の計算（選択された期間と同じ長さの前の期間）
    let previousPeriodConditions = [];
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const periodLength = end.getTime() - start.getTime();
      
      const previousStart = new Date(start.getTime() - periodLength);
      const previousEnd = new Date(start.getTime() - 1000 * 60 * 60 * 24); // 1日前まで
      
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      previousPeriodConditions = [
        gte(orders.salesStartDt, formatDate(previousStart)),
        lte(orders.salesStartDt, formatDate(previousEnd))
      ];
    } else {
      // 期間が指定されていない場合は全データの半分の期間と比較
      if (dateRangeResult && dateRangeResult[0] && dateRangeResult[0].minDate && dateRangeResult[0].maxDate) {
        const minDate = new Date(dateRangeResult[0].minDate);
        const maxDate = new Date(dateRangeResult[0].maxDate);
        const totalPeriod = maxDate.getTime() - minDate.getTime();
        const halfPeriod = totalPeriod / 2;
        
        const midPoint = new Date(minDate.getTime() + halfPeriod);
        
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        previousPeriodConditions = [
          gte(orders.salesStartDt, formatDate(minDate)),
          lte(orders.salesStartDt, formatDate(midPoint))
        ];
      } else {
        // データが存在しない場合は空の条件
        previousPeriodConditions = [];
      }
    }

    // 期間フィルターの条件を構築
    const currentPeriodConditions = [];
    if (startDate && endDate) {
      currentPeriodConditions.push(gte(orders.salesStartDt, startDate));
      currentPeriodConditions.push(lte(orders.salesStartDt, endDate));
    } else if (!startDate && !endDate) {
      // 期間が指定されていない場合は後半データを現在期間とする
      if (dateRangeResult && dateRangeResult[0] && dateRangeResult[0].minDate && dateRangeResult[0].maxDate) {
        const minDate = new Date(dateRangeResult[0].minDate);
        const maxDate = new Date(dateRangeResult[0].maxDate);
        const totalPeriod = maxDate.getTime() - minDate.getTime();
        const halfPeriod = totalPeriod / 2;
        
        const midPoint = new Date(minDate.getTime() + halfPeriod);
        
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        currentPeriodConditions.push(gte(orders.salesStartDt, formatDate(midPoint)));
        currentPeriodConditions.push(lte(orders.salesStartDt, formatDate(maxDate)));
      }
    } else {
      if (startDate) {
        currentPeriodConditions.push(gte(orders.salesStartDt, startDate));
      }
      if (endDate) {
        currentPeriodConditions.push(lte(orders.salesStartDt, endDate));
      }
    }

    // 現在選択された期間の集計
    const currentMetrics = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.orderId})`,
        totalCustomers: sql<number>`COUNT(DISTINCT ${orders.customerId})`,
        unpaidOrders: sql<number>`COUNT(DISTINCT CASE WHEN ${orders.isPaid} = false AND ${orders.salesEndDt} < CURRENT_DATE THEN ${orders.orderId} END)`,
        totalOrdersForRate: sql<number>`COUNT(DISTINCT CASE WHEN ${orders.salesEndDt} < CURRENT_DATE THEN ${orders.orderId} END)`
      })
      .from(orders)
      .where(currentPeriodConditions.length > 0 ? and(...currentPeriodConditions) : undefined);

    // 比較期間の集計
    const previousMetrics = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.orderId})`,
        totalCustomers: sql<number>`COUNT(DISTINCT ${orders.customerId})`,
        unpaidOrders: sql<number>`COUNT(DISTINCT CASE WHEN ${orders.isPaid} = false AND ${orders.salesEndDt} < CURRENT_DATE THEN ${orders.orderId} END)`,
        totalOrdersForRate: sql<number>`COUNT(DISTINCT CASE WHEN ${orders.salesEndDt} < CURRENT_DATE THEN ${orders.orderId} END)`
      })
      .from(orders)
      .where(previousPeriodConditions.length > 0 ? and(...previousPeriodConditions) : undefined);

    const current = currentMetrics[0];
    const previousData = previousMetrics[0];

    // 増加率と増加数を計算
    const calculateGrowth = (current: number, previous: number) => {
      const count = current - previous;
      if (previous === 0) {
        // 前期間が0の場合、現在値があれば100%増加として扱う
        return { rate: current > 0 ? 100 : 0, count };
      }
      const rate = ((current - previous) / previous) * 100;
      return { rate, count };
    };

    const currentRevenue = parseFloat(current.totalRevenue);
    const previousRevenue = parseFloat(previousData.totalRevenue);
    const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);

    const ordersGrowth = calculateGrowth(Number(current.totalOrders), Number(previousData.totalOrders));
    const customersGrowth = calculateGrowth(Number(current.totalCustomers), Number(previousData.totalCustomers));
    const unpaidOrdersGrowth = calculateGrowth(current.unpaidOrders, previousData.unpaidOrders);

    // 未払い率を計算
    const currentUnpaidRate = current.totalOrdersForRate > 0 ? (current.unpaidOrders / current.totalOrdersForRate) * 100 : 0;
    const previousUnpaidRate = previousData.totalOrdersForRate > 0 ? (previousData.unpaidOrders / previousData.totalOrdersForRate) * 100 : 0;
    const unpaidRateGrowth = calculateGrowth(currentUnpaidRate, previousUnpaidRate);

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
        },
        unpaidOrders: {
          value: current.unpaidOrders,
          growth: unpaidOrdersGrowth
        },
        unpaidRate: {
          value: currentUnpaidRate,
          growth: unpaidRateGrowth
        }
      },
      previousPeriod: {
        totalRevenue: previousRevenue,
        totalOrders: Number(previousData.totalOrders),
        totalCustomers: Number(previousData.totalCustomers),
        unpaidOrders: previousData.unpaidOrders,
        unpaidRate: previousUnpaidRate
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