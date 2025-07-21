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
  
  // Subscription revenue for current month
  subscriptionRevenue: sql<string>`
    COALESCE(
      (SELECT SUM(${subscriptionPaid.amount}) 
       FROM ${subscriptionPaid} 
       WHERE ${subscriptionPaid.isPaid} = true 
       AND ${subscriptionPaid.year} = ${year}
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

  // Count of subscription orders for current month
  subscriptionOrderCount: sql<number>`
    (SELECT COUNT(DISTINCT ${subscriptionPaid.subscriptionId}) 
     FROM ${subscriptionPaid} 
     WHERE ${subscriptionPaid.year} = ${year}
     AND ${subscriptionPaid.month} = ${month})
  `,

  // Total unique customers (all time)
  totalCustomers: sql<number>`(SELECT COUNT(*) FROM ${customers})`
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
  
  // Average subscription value for current month
  subscriptionAvgValue: sql<string>`
    COALESCE(
      (SELECT AVG(${subscriptionPaid.amount}) 
       FROM ${subscriptionPaid} 
       WHERE ${subscriptionPaid.year} = ${year}
       AND ${subscriptionPaid.month} = ${month}), 
      '0'
    )
  `
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
  totalSales: sql<number>`COALESCE(SUM(amount), 0)`
});