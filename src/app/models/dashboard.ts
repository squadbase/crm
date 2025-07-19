import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { lte, gte, and } from 'drizzle-orm';
import { 
  getCurrentMetricsQuery, 
  getMetricsUpToDateQuery, 
  getMonthlySalesQuery 
} from './aggregates/dashboard-metrics';

export interface MetricGrowth {
  rate: number;
  count: number;
}

export interface MetricData {
  value: number;
  growth: MetricGrowth;
}

export interface DashboardMetrics {
  totalRevenue: MetricData;
  totalOrders: MetricData;
  totalCustomers: MetricData;
}

export interface MonthlySalesData {
  month: string;
  totalSales: number;
  projectSales: number;
  productSales: number;
  orderCount: number;
}

/**
 * Calculate growth metrics comparing current vs previous period
 */
function calculateGrowth(current: number, previous: number): MetricGrowth {
  const count = current - previous;
  if (previous === 0) {
    return { rate: current > 0 ? 100 : 0, count };
  }
  const rate = ((current - previous) / previous) * 100;
  return { rate, count };
}

/**
 * Get dashboard metrics with growth comparison to last month
 */
export async function getDashboardMetrics(): Promise<{
  metrics: DashboardMetrics;
  previousPeriod: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
  };
}> {
  const now = new Date();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Get current metrics (all time)
  const currentMetrics = await db
    .select(getCurrentMetricsQuery())
    .from(orders);

  // Get metrics up to last month end
  const upToLastMonthMetrics = await db
    .select(getMetricsUpToDateQuery())
    .from(orders)
    .where(lte(orders.createdAt, lastMonthEnd));

  const current = currentMetrics[0];
  const upToLastMonth = upToLastMonthMetrics[0];

  const currentRevenue = parseFloat(current.totalRevenue);
  const upToLastMonthRevenue = parseFloat(upToLastMonth.totalRevenue);
  const revenueGrowth = calculateGrowth(currentRevenue, upToLastMonthRevenue);

  const ordersGrowth = calculateGrowth(Number(current.totalOrders), Number(upToLastMonth.totalOrders));
  const customersGrowth = calculateGrowth(Number(current.totalCustomers), Number(upToLastMonth.totalCustomers));

  return {
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
  };
}

/**
 * Get monthly sales data for charts
 */
export async function getMonthlySalesData(
  startDate?: Date,
  endDate?: Date
): Promise<MonthlySalesData[]> {
  let query = db
    .select(getMonthlySalesQuery())
    .from(orders)
    .groupBy(getMonthlySalesQuery().month)
    .orderBy(getMonthlySalesQuery().month);

  // Apply date filters if provided
  const conditions = [];
  if (startDate) {
    conditions.push(gte(orders.salesStartDt, startDate));
  }
  if (endDate) {
    conditions.push(lte(orders.salesStartDt, endDate));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const result = await query;
  
  return result.map(row => ({
    month: row.month,
    totalSales: Number(row.totalSales),
    projectSales: Number(row.projectSales),
    productSales: Number(row.productSales),
    orderCount: Number(row.orderCount)
  }));
}