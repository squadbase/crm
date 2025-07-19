import { sql } from 'drizzle-orm';
import { orders } from '@/lib/db/schema';

/**
 * Dashboard metrics aggregation queries
 */

// Get current total metrics (all time)
export const getCurrentMetricsQuery = () => ({
  totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
  totalOrders: sql<number>`COUNT(DISTINCT ${orders.orderId})`,
  totalCustomers: sql<number>`COUNT(DISTINCT ${orders.customerId})`
});

// Get metrics up to a specific date
export const getMetricsUpToDateQuery = () => ({
  totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
  totalOrders: sql<number>`COUNT(DISTINCT ${orders.orderId})`,
  totalCustomers: sql<number>`COUNT(DISTINCT ${orders.customerId})`
});

// Monthly sales aggregation for charts
export const getMonthlySalesQuery = () => ({
  month: sql<string>`TO_CHAR(${orders.salesStartDt}, 'YYYY-MM')`,
  totalSales: sql<number>`SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END)`,
  projectSales: sql<number>`SUM(CASE WHEN ${orders.isPaid} = true AND ${orders.serviceType} = 'project' THEN ${orders.amount} ELSE 0 END)`,
  productSales: sql<number>`SUM(CASE WHEN ${orders.isPaid} = true AND ${orders.serviceType} = 'product' THEN ${orders.amount} ELSE 0 END)`,
  orderCount: sql<number>`COUNT(DISTINCT ${orders.orderId})`
});