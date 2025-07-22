import { db } from '@/lib/db';
import { orders, customers } from '@/lib/db/schema';
import { eq, desc, asc, lte, gte, and, or, like, count, sum, sql } from 'drizzle-orm';

export interface OrderFilters {
  customerId?: string;
  isPaid?: boolean;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface OrderSortOptions {
  field: 'created' | 'amount' | 'customer';
  direction: 'asc' | 'desc';
}

/**
 * Get all orders with optional filtering and sorting
 */
export async function getOrders({
  filters = {},
  sort = { field: 'created', direction: 'desc' },
  limit,
  offset = 0
}: {
  filters?: OrderFilters;
  sort?: OrderSortOptions;
  limit?: number;
  offset?: number;
} = {}) {
  try {
    // Join with customers table to get customer name
    let query = db
      .select({
        orderId: orders.orderId,
        customerId: orders.customerId,
        customerName: customers.customerName,
        amount: orders.amount,
        salesAt: orders.salesAt,
        isPaid: orders.isPaid,
        description: orders.description,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.customerId));

    // Apply filters
    const conditions = [];
    
    if (filters.customerId) {
      conditions.push(eq(orders.customerId, filters.customerId));
    }
    
    if (filters.isPaid !== undefined) {
      conditions.push(eq(orders.isPaid, filters.isPaid));
    }
    
    if (filters.startDate) {
      conditions.push(gte(orders.createdAt, filters.startDate));
    }
    
    if (filters.endDate) {
      conditions.push(lte(orders.createdAt, filters.endDate));
    }
    
    if (filters.search) {
      conditions.push(
        or(
          like(customers.customerName, `%${filters.search}%`),
          like(orders.description, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    // Apply sorting
    const sortField = sort.field === 'created' ? orders.createdAt :
                     sort.field === 'amount' ? orders.amount :
                     customers.customerName;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).orderBy(sort.direction === 'desc' ? desc(sortField) : asc(sortField));

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
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId: string) {
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.orderId, orderId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Get a single order with customer details by ID
 */
export async function getOrderWithCustomerDetails(orderId: string) {
  const result = await db
    .select({
      orderId: orders.orderId,
      customerId: orders.customerId,
      customerName: customers.customerName,
      amount: orders.amount,
      salesAt: orders.salesAt,
      isPaid: orders.isPaid,
      description: orders.description,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.customerId))
    .where(eq(orders.orderId, orderId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Create a new order
 */
export async function createOrder(orderData: typeof orders.$inferInsert) {
  // Convert salesAt to Date object if it's a string
  const processedData = {
    ...orderData,
    salesAt: typeof orderData.salesAt === 'string' 
      ? new Date(orderData.salesAt) 
      : orderData.salesAt
  };

  const result = await db
    .insert(orders)
    .values(processedData)
    .returning();
  
  return result[0];
}

/**
 * Update an existing order
 */
export async function updateOrder(orderId: string, orderData: Partial<typeof orders.$inferInsert>) {
  // Convert salesAt to Date object if it's a string
  const processedData = {
    ...orderData,
    updatedAt: new Date()
  };

  if (orderData.salesAt && typeof orderData.salesAt === 'string') {
    processedData.salesAt = new Date(orderData.salesAt);
  }

  const result = await db
    .update(orders)
    .set(processedData)
    .where(eq(orders.orderId, orderId))
    .returning();
  
  return result[0] || null;
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId: string) {
  const result = await db
    .delete(orders)
    .where(eq(orders.orderId, orderId))
    .returning();
  
  return result[0] || null;
}

/**
 * Get recent orders
 */
export async function getRecentOrders(limit: number = 5) {
  return await getOrders({
    sort: { field: 'created', direction: 'desc' },
    limit
  });
}

/**
 * Get order count
 */
export async function getOrderCount(filters: OrderFilters = {}) {
  let query = db
    .select({ count: count() })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.customerId));

  const conditions = [];
  
  if (filters.customerId) {
    conditions.push(eq(orders.customerId, filters.customerId));
  }
  
  if (filters.isPaid !== undefined) {
    conditions.push(eq(orders.isPaid, filters.isPaid));
  }
  
  if (filters.startDate) {
    conditions.push(gte(orders.createdAt, filters.startDate));
  }
  
  if (filters.endDate) {
    conditions.push(lte(orders.createdAt, filters.endDate));
  }
  
  if (filters.search) {
    conditions.push(
      or(
        like(customers.customerName, `%${filters.search}%`),
        like(orders.description, `%${filters.search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).where(conditions.length === 1 ? conditions[0] : and(...conditions));
  }

  const result = await query;
  return Number(result[0]?.count || 0);
}

/**
 * Get orders summary with total and unpaid amounts for a date range
 */
export async function getOrdersSummary(salesStartDt?: string, salesEndDt?: string) {
  try {
    // Build WHERE conditions (filter based on salesAt)
    const conditions = [];
    
    if (salesStartDt) {
      conditions.push(gte(orders.salesAt, new Date(salesStartDt)));
    }
    if (salesEndDt) {
      conditions.push(lte(orders.salesAt, new Date(salesEndDt)));
    }

    // Aggregate one-time payment orders (only totalAmount and unpaidAmount for selected period)
    const onetimeSummary = await db
      .select({
        totalAmount: sum(orders.amount),
        unpaidAmount: sql<string>`SUM(CASE WHEN ${orders.isPaid} = false THEN ${orders.amount} ELSE 0 END)`,
      })
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Calculate totals (only one-time payments are targeted)
    const onetimeData = onetimeSummary[0];

    return {
      totalAmount: onetimeData.totalAmount || '0',
      unpaidAmount: onetimeData.unpaidAmount || '0',
    };
  } catch (error) {
    // Error occurred while calculating orders summary
    throw error;
  }
}