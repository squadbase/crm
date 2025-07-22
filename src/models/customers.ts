import { db } from '@/lib/db';
import {
  customers,
  orders,
  subscriptions,
  subscriptionPaid,
} from '@/lib/db/schema';
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
  offset = 0,
}: {
  filters?: CustomerFilters;
  sort?: CustomerSortOptions;
  limit?: number;
  offset?: number;
} = {}): Promise<CustomerSummary[]> {
  try {
    // Build the base query with customer aggregations including subscription revenue
    let query = db
      .select({
        customerId: customers.customerId,
        customerName: customers.customerName,
        orderCount: sql<number>`COUNT(DISTINCT ${orders.orderId})`,
        onetimeRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
        subscriptionRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${subscriptionPaid.isPaid} = true THEN ${subscriptionPaid.amount} ELSE 0 END), 0)`,
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0) + COALESCE(SUM(CASE WHEN ${subscriptionPaid.isPaid} = true THEN ${subscriptionPaid.amount} ELSE 0 END), 0)`,
        createdAt: customers.createdAt,
      })
      .from(customers)
      .leftJoin(orders, eq(customers.customerId, orders.customerId))
      .leftJoin(
        subscriptions,
        eq(customers.customerId, subscriptions.customerId),
      )
      .leftJoin(
        subscriptionPaid,
        eq(subscriptions.subscriptionId, subscriptionPaid.subscriptionId),
      )
      .groupBy(
        customers.customerId,
        customers.customerName,
        customers.createdAt,
      );

    // Apply search filter
    if (filters.search && filters.search.trim() !== '') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).where(
        like(customers.customerName, `%${filters.search.trim()}%`),
      );
    }

    // Apply sorting
    let orderByClause;
    switch (sort.field) {
      case 'name':
        orderByClause =
          sort.direction === 'desc'
            ? desc(customers.customerName)
            : asc(customers.customerName);
        break;
      case 'revenue':
        orderByClause =
          sort.direction === 'desc'
            ? desc(
                sql`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0) + COALESCE(SUM(CASE WHEN ${subscriptionPaid.isPaid} = true THEN ${subscriptionPaid.amount} ELSE 0 END), 0)`,
              )
            : asc(
                sql`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0) + COALESCE(SUM(CASE WHEN ${subscriptionPaid.isPaid} = true THEN ${subscriptionPaid.amount} ELSE 0 END), 0)`,
              );
        break;
      case 'orders':
        orderByClause =
          sort.direction === 'desc'
            ? desc(sql`COUNT(DISTINCT ${orders.orderId})`)
            : asc(sql`COUNT(DISTINCT ${orders.orderId})`);
        break;
      default:
        orderByClause =
          sort.direction === 'desc'
            ? desc(customers.createdAt)
            : asc(customers.createdAt);
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

    // Transform result data to expected format
    return result.map((row) => ({
      customerId: row.customerId,
      customerName: row.customerName,
      orderCount: Number(row.orderCount),
      onetimeRevenue: Number(row.onetimeRevenue),
      subscriptionRevenue: Number(row.subscriptionRevenue),
      totalRevenue: Number(row.totalRevenue),
      createdAt: row.createdAt,
    }));
  } catch (error) {
    // Error occurred while fetching customers
    throw error;
  }
}

/**
 * Get a single customer by ID with summary data
 */
export async function getCustomerById(
  customerId: string,
): Promise<CustomerSummary | null> {
  const result = await db
    .select({
      customerId: customers.customerId,
      customerName: customers.customerName,
      orderCount: sql<number>`COUNT(DISTINCT ${orders.orderId})`,
      onetimeRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
      subscriptionRevenue: sql<number>`0`,
      totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END), 0)`,
      createdAt: customers.createdAt,
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
    createdAt: customer.createdAt,
  };
}

/**
 * Get top customers by revenue
 */
export async function getTopCustomers(
  limit: number = 5,
): Promise<CustomerSummary[]> {
  return await getCustomers({
    sort: { field: 'revenue', direction: 'desc' },
    limit,
  });
}

/**
 * Get customer count
 */
export async function getCustomerCount(
  filters: CustomerFilters = {},
): Promise<number> {
  try {
    let query = db
      .select({ count: sql<number>`COUNT(DISTINCT ${customers.customerId})` })
      .from(customers);

    // Apply search filter
    if (filters.search && filters.search.trim() !== '') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).where(
        like(customers.customerName, `%${filters.search.trim()}%`),
      );
    }

    const result = await query;
    return Number(result[0].count);
  } catch (error) {
    // Error occurred while counting customers
    throw error;
  }
}

/**
 * Search customers by name
 */
export async function searchCustomers(
  searchTerm: string,
  limit: number = 10,
): Promise<CustomerSummary[]> {
  return await getCustomers({
    filters: { search: searchTerm },
    sort: { field: 'name', direction: 'asc' },
    limit,
  });
}

/**
 * Get customer details with orders, subscriptions, and stats
 */
export async function getCustomerDetails(customerId: string) {
  try {
    // Get customer basic info
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.customerId, customerId))
      .limit(1);

    if (customer.length === 0) {
      return null;
    }

    // Get customer's orders
    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.salesAt));

    // Get customer's subscriptions with payments
    const customerSubscriptions = await db
      .select({
        subscriptionId: subscriptions.subscriptionId,
        description: subscriptions.description,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        year: subscriptionPaid.year,
        month: subscriptionPaid.month,
        amount: subscriptionPaid.amount,
        isPaid: subscriptionPaid.isPaid,
        paidCreatedAt: subscriptionPaid.createdAt,
      })
      .from(subscriptions)
      .leftJoin(
        subscriptionPaid,
        eq(subscriptions.subscriptionId, subscriptionPaid.subscriptionId),
      )
      .where(eq(subscriptions.customerId, customerId))
      .orderBy(
        desc(subscriptionPaid.year),
        desc(subscriptionPaid.month),
        desc(subscriptionPaid.createdAt),
      );

    // Calculate stats
    const totalOrders = customerOrders.length;
    const onetimeRevenue = customerOrders
      .filter((order) => order.isPaid)
      .reduce((sum, order) => sum + parseFloat(order.amount), 0);
    const subscriptionRevenue = customerSubscriptions
      .filter((sub) => sub.isPaid)
      .reduce((sum, sub) => sum + parseFloat(sub.amount || '0'), 0);
    const totalRevenue = onetimeRevenue + subscriptionRevenue;
    const unpaidOrders = customerOrders.filter((order) => !order.isPaid).length;
    const totalSubscriptions = Array.from(
      new Set(customerSubscriptions.map((s) => s.subscriptionId)),
    ).length;

    return {
      customer: customer[0],
      orders: customerOrders,
      subscriptions: customerSubscriptions,
      stats: {
        totalOrders,
        totalSubscriptions,
        onetimeRevenue,
        subscriptionRevenue,
        totalRevenue,
        unpaidOrders,
        paidOrders: totalOrders - unpaidOrders,
      },
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Update a customer
 */
export async function updateCustomer(
  customerId: string,
  customerData: { customerName: string },
) {
  try {
    const updatedCustomer = await db
      .update(customers)
      .set({
        customerName: customerData.customerName,
        updatedAt: new Date(),
      })
      .where(eq(customers.customerId, customerId))
      .returning();

    return updatedCustomer.length > 0 ? updatedCustomer[0] : null;
  } catch (error) {
    throw error;
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(customerData: { customerName: string }) {
  try {
    const newCustomer = await db
      .insert(customers)
      .values({
        customerName: customerData.customerName.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newCustomer.length > 0 ? newCustomer[0] : null;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a customer (only if no orders exist)
 */
export async function deleteCustomer(customerId: string) {
  try {
    // Check if customer has orders
    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .limit(1);

    if (customerOrders.length > 0) {
      throw new Error('Cannot delete customer with existing orders');
    }

    const deletedCustomer = await db
      .delete(customers)
      .where(eq(customers.customerId, customerId))
      .returning();

    return deletedCustomer.length > 0 ? deletedCustomer[0] : null;
  } catch (error) {
    throw error;
  }
}
