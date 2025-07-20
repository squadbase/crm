import { db } from '@/lib/db';
import { orders, customers } from '@/lib/db/schema';
import { eq, desc, asc, lte, gte, and, or, like, count } from 'drizzle-orm';

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
 * Create a new order
 */
export async function createOrder(orderData: typeof orders.$inferInsert) {
  const result = await db
    .insert(orders)
    .values(orderData)
    .returning();
  
  return result[0];
}

/**
 * Update an existing order
 */
export async function updateOrder(orderId: string, orderData: Partial<typeof orders.$inferInsert>) {
  const result = await db
    .update(orders)
    .set({
      ...orderData,
      updatedAt: new Date()
    })
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