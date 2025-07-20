import { db } from '@/lib/db';
import { customers, orders, subscriptions, subscriptionPaid } from '@/lib/db/schema';
import { eq, desc, asc, like, sql } from 'drizzle-orm';

export interface CustomerSummary {
  customerId: string;
  customerName: string;
  orderCount: number;
  onetimeRevenue: number;
  subscriptionRevenue: number;
  totalRevenue: number;
  createdAt: Date;
}

export interface CustomerFilters {
  search?: string;
}

export interface CustomerSortOptions {
  field: 'name' | 'revenue' | 'orders' | 'created';
  direction: 'asc' | 'desc';
}

/**
 * Get customer summary data with aggregated order information
 */
export async function getCustomers({
  filters = {},
  sort = { field: 'revenue', direction: 'desc' },
  limit,
  offset = 0
}: {
  filters?: CustomerFilters;
  sort?: CustomerSortOptions;
  limit?: number;
  offset?: number;
} = {}): Promise<CustomerSummary[]> {
  try {
    console.log('Building customer query with params:', { filters, sort, limit, offset });
    
    // Build the base query with customer aggregations including subscription revenue
    let query = db
      .select({
        customerId: customers.customerId,
        customerName: customers.customerName,
        orderCount: sql<number>`COUNT(DISTINCT ${orders.orderId})`,
        onetimeRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
        subscriptionRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${subscriptionPaid.isPaid} = true THEN ${subscriptionPaid.amount} ELSE 0 END), 0)`,
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0) + COALESCE(SUM(CASE WHEN ${subscriptionPaid.isPaid} = true THEN ${subscriptionPaid.amount} ELSE 0 END), 0)`,
        createdAt: customers.createdAt
      })
      .from(customers)
      .leftJoin(orders, eq(customers.customerId, orders.customerId))
      .leftJoin(subscriptions, eq(customers.customerId, subscriptions.customerId))
      .leftJoin(subscriptionPaid, eq(subscriptions.subscriptionId, subscriptionPaid.subscriptionId))
      .groupBy(customers.customerId, customers.customerName, customers.createdAt);

    // Apply search filter
    if (filters.search && filters.search.trim() !== '') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).where(
        like(customers.customerName, `%${filters.search.trim()}%`)
      );
    }

    // Apply sorting
    let orderByClause;
    switch (sort.field) {
      case 'name':
        orderByClause = sort.direction === 'desc' ? desc(customers.customerName) : asc(customers.customerName);
        break;
      case 'revenue':
        orderByClause = sort.direction === 'desc' 
          ? desc(sql`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0) + COALESCE(SUM(CASE WHEN ${subscriptionPaid.isPaid} = true THEN ${subscriptionPaid.amount} ELSE 0 END), 0)`)
          : asc(sql`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0) + COALESCE(SUM(CASE WHEN ${subscriptionPaid.isPaid} = true THEN ${subscriptionPaid.amount} ELSE 0 END), 0)`);
        break;
      case 'orders':
        orderByClause = sort.direction === 'desc' 
          ? desc(sql`COUNT(DISTINCT ${orders.orderId})`)
          : asc(sql`COUNT(DISTINCT ${orders.orderId})`);
        break;
      default:
        orderByClause = sort.direction === 'desc' ? desc(customers.createdAt) : asc(customers.createdAt);
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).orderBy(orderByClause);

    // Apply pagination
    if (limit) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).limit(limit);
    }
    if (offset > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).offset(offset);
    }

    const result = await query;
    
    console.log('Database customer result:', result);
    return result.map(row => ({
      customerId: row.customerId,
      customerName: row.customerName,
      orderCount: Number(row.orderCount),
      onetimeRevenue: Number(row.onetimeRevenue),
      subscriptionRevenue: Number(row.subscriptionRevenue),
      totalRevenue: Number(row.totalRevenue),
      createdAt: row.createdAt
    }));
  } catch (error) {
    console.error('Error in getCustomers:', error);
    throw error;
  }
}

/**
 * Get a single customer by ID with summary data
 */
export async function getCustomerById(customerId: string): Promise<CustomerSummary | null> {
  const result = await db
    .select({
      customerId: customers.customerId,
      customerName: customers.customerName,
      orderCount: sql<number>`COUNT(DISTINCT ${orders.orderId})`,
      onetimeRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
      subscriptionRevenue: sql<number>`0`,
      totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
      createdAt: customers.createdAt
    })
    .from(customers)
    .leftJoin(orders, eq(customers.customerId, orders.customerId))
    .where(eq(customers.customerId, customerId))
    .groupBy(customers.customerId, customers.customerName, customers.createdAt)
    .limit(1);
  
  const customer = result[0];
  if (!customer) return null;
  
  return {
    customerId: customer.customerId,
    customerName: customer.customerName,
    orderCount: Number(customer.orderCount),
    onetimeRevenue: Number(customer.onetimeRevenue),
    subscriptionRevenue: Number(customer.subscriptionRevenue),
    totalRevenue: Number(customer.totalRevenue),
    createdAt: customer.createdAt
  };
}

/**
 * Get top customers by revenue
 */
export async function getTopCustomers(limit: number = 5): Promise<CustomerSummary[]> {
  return await getCustomers({
    sort: { field: 'revenue', direction: 'desc' },
    limit
  });
}

/**
 * Get customer count
 */
export async function getCustomerCount(filters: CustomerFilters = {}): Promise<number> {
  try {
    let query = db
      .select({ count: sql<number>`COUNT(DISTINCT ${customers.customerId})` })
      .from(customers);

    // Apply search filter
    if (filters.search && filters.search.trim() !== '') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).where(
        like(customers.customerName, `%${filters.search.trim()}%`)
      );
    }

    const result = await query;
    return Number(result[0].count);
  } catch (error) {
    console.error('Error in getCustomerCount:', error);
    throw error;
  }
}

/**
 * Search customers by name
 */
export async function searchCustomers(searchTerm: string, limit: number = 10): Promise<CustomerSummary[]> {
  return await getCustomers({
    filters: { search: searchTerm },
    sort: { field: 'name', direction: 'asc' },
    limit
  });
}