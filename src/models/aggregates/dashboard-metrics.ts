import { sql } from 'drizzle-orm';
import { orders, subscriptionPaid, customers } from '@/lib/db/schema';

/**
 * Dashboard metrics aggregation queries for new schema with onetime/subscription split
 */

// Get current month metrics for dashboard
export const getCurrentMonthMetricsQuery = (year: number, month: number) => ({
  // Onetime revenue for current month
  onetimeRevenue: sql<string>`
    COALESCE(
      (SELECT SUM(${orders.amount})
       FROM ${orders}
       WHERE EXTRACT(YEAR FROM ${orders.salesAt}) = ${year}
       AND EXTRACT(MONTH FROM ${orders.salesAt}) = ${month}),
      '0'
    )
  `,

  // Subscription revenue for current month (includes both paid and unpaid)
  subscriptionRevenue: sql<string>`
    COALESCE(
      (SELECT SUM(${subscriptionPaid.amount})
       FROM ${subscriptionPaid}
       WHERE ${subscriptionPaid.year} = ${year}
       AND ${subscriptionPaid.month} = ${month}),
      '0'
    )
  `,

  // Count of onetime orders for current month
  onetimeOrderCount: sql<number>`
    (SELECT COUNT(*)
     FROM ${orders}
     WHERE EXTRACT(YEAR FROM ${orders.salesAt}) = ${year}
     AND EXTRACT(MONTH FROM ${orders.salesAt}) = ${month})
  `,

  // Count of subscription orders for current month (includes both paid and unpaid)
  subscriptionOrderCount: sql<number>`
    (SELECT COUNT(DISTINCT ${subscriptionPaid.subscriptionId})
     FROM ${subscriptionPaid}
     WHERE ${subscriptionPaid.year} = ${year}
     AND ${subscriptionPaid.month} = ${month})
  `,

  // Total unique customers (all time)
  totalCustomers: sql<number>`(SELECT COUNT(*) FROM ${customers})`,
});

// Get date range metrics for dashboard (handles period aggregation)
export const getDateRangeMetricsQuery = (startDate: string, endDate: string) => ({
  // Onetime revenue for date range
  onetimeRevenue: sql<string>`
    COALESCE(
      (SELECT SUM(${orders.amount})
       FROM ${orders}
       WHERE ${orders.salesAt} >= ${startDate}
       AND ${orders.salesAt} <= ${endDate}),
      '0'
    )
  `,

  // Subscription revenue for date range (includes both paid and unpaid within period)
  subscriptionRevenue: sql<string>`
    COALESCE(
      (SELECT SUM(${subscriptionPaid.amount})
       FROM ${subscriptionPaid}
       WHERE MAKE_DATE(${subscriptionPaid.year}, ${subscriptionPaid.month}, 1) >= ${startDate}
       AND MAKE_DATE(${subscriptionPaid.year}, ${subscriptionPaid.month}, 1) <= ${endDate}),
      '0'
    )
  `,

  // Count of onetime orders for date range
  onetimeOrderCount: sql<number>`
    (SELECT COUNT(*)
     FROM ${orders}
     WHERE ${orders.salesAt} >= ${startDate}
     AND ${orders.salesAt} <= ${endDate})
  `,

  // Count of unique subscription IDs with payments in the date range (includes both paid and unpaid)
  subscriptionOrderCount: sql<number>`
    (SELECT COUNT(DISTINCT ${subscriptionPaid.subscriptionId})
     FROM ${subscriptionPaid}
     WHERE MAKE_DATE(${subscriptionPaid.year}, ${subscriptionPaid.month}, 1) >= ${startDate}
     AND MAKE_DATE(${subscriptionPaid.year}, ${subscriptionPaid.month}, 1) <= ${endDate})
  `,

  // Total unique customers (all time)
  totalCustomers: sql<number>`(SELECT COUNT(*) FROM ${customers})`,
});

// Get KPI metrics for dashboard
export const getKPIMetricsQuery = (year: number, month: number) => ({
  // Average onetime order value for current month
  onetimeAvgOrderValue: sql<string>`
    COALESCE(
      (SELECT AVG(${orders.amount})
       FROM ${orders}
       WHERE EXTRACT(YEAR FROM ${orders.salesAt}) = ${year}
       AND EXTRACT(MONTH FROM ${orders.salesAt}) = ${month}),
      '0'
    )
  `,

  // Average subscription value for current month (includes both paid and unpaid)
  subscriptionAvgValue: sql<string>`
    COALESCE(
      (SELECT AVG(${subscriptionPaid.amount})
       FROM ${subscriptionPaid}
       WHERE ${subscriptionPaid.year} = ${year}
       AND ${subscriptionPaid.month} = ${month}),
      '0'
    )
  `,
});

// Get KPI metrics for date range
export const getDateRangeKPIMetricsQuery = (startDate: string, endDate: string) => ({
  // Average onetime order value for date range
  onetimeAvgOrderValue: sql<string>`
    COALESCE(
      (SELECT AVG(${orders.amount})
       FROM ${orders}
       WHERE ${orders.salesAt} >= ${startDate}
       AND ${orders.salesAt} <= ${endDate}),
      '0'
    )
  `,

  // Average subscription value for date range (includes both paid and unpaid)
  subscriptionAvgValue: sql<string>`
    COALESCE(
      (SELECT AVG(${subscriptionPaid.amount})
       FROM ${subscriptionPaid}
       WHERE MAKE_DATE(${subscriptionPaid.year}, ${subscriptionPaid.month}, 1) >= ${startDate}
       AND MAKE_DATE(${subscriptionPaid.year}, ${subscriptionPaid.month}, 1) <= ${endDate}),
      '0'
    )
  `,
});

// Monthly sales aggregation for time-series chart
export const getMonthlySalesQuery = () => ({
  year: sql<number>`EXTRACT(YEAR FROM month_date)`,
  month: sql<number>`EXTRACT(MONTH FROM month_date)`,
  monthLabel: sql<string>`TO_CHAR(month_date, 'YYYY-MM')`,
  onetimeSales: sql<number>`
    COALESCE(SUM(
      CASE WHEN order_type = 'onetime' THEN amount ELSE 0 END
    ), 0)
  `,
  subscriptionSales: sql<number>`
    COALESCE(SUM(
      CASE WHEN order_type = 'subscription' THEN amount ELSE 0 END
    ), 0)
  `,
  totalSales: sql<number>`COALESCE(SUM(amount), 0)`,
});
