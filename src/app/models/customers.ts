import { db } from '@/lib/db';
import { customers, orders } from '@/lib/db/schema';
import { eq, desc, asc, like, sql, and } from 'drizzle-orm';

export interface CustomerSummary {
  customerId: string;
  customerName: string;
  orderCount: number;
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
    
    // Build the base query with customer aggregations
    let query = db
      .select({
        customerId: customers.customerId,
        customerName: customers.customerName,
        orderCount: sql<number>`COUNT(${orders.orderId})`,
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
        createdAt: customers.createdAt
      })
      .from(customers)
      .leftJoin(orders, eq(customers.customerId, orders.customerId))
      .groupBy(customers.customerId, customers.customerName, customers.createdAt);

    // Apply search filter
    if (filters.search && filters.search.trim() !== '') {
      query = query.where(
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
          ? desc(sql`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`)
          : asc(sql`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`);
        break;
      case 'orders':
        orderByClause = sort.direction === 'desc' 
          ? desc(sql`COUNT(${orders.orderId})`)
          : asc(sql`COUNT(${orders.orderId})`);
        break;
      default:
        orderByClause = sort.direction === 'desc' ? desc(customers.createdAt) : asc(customers.createdAt);
    }
    
    query = query.orderBy(orderByClause);

    // Apply pagination
    if (limit) {
      query = query.limit(limit);
    }
    if (offset > 0) {
      query = query.offset(offset);
    }

    const result = await query;
    
    console.log('Database customer result:', result);
    return result.map(row => ({
      customerId: row.customerId,
      customerName: row.customerName,
      orderCount: Number(row.orderCount),
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
      customerId: orders.customerId,
      customerName: orders.customerName,
      orderCount: sql<number>`COUNT(DISTINCT ${orders.orderId})`,
      totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
      createdAt: sql<Date>`MIN(${orders.createdAt})`
    })
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .groupBy(orders.customerId, orders.customerName)
    .limit(1);
  
  return result[0] || null;
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
      query = query.where(
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