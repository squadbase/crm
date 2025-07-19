import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq, desc, asc, lte, gte, and, or, like } from 'drizzle-orm';

export interface OrderFilters {
  customerId?: string;
  isPaid?: boolean;
  paymentType?: 'onetime' | 'subscription';
  serviceType?: 'project' | 'product';
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface OrderSortOptions {
  field: 'created' | 'amount' | 'customer' | 'payment';
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
  let query = db.select().from(orders);

  // Apply filters
  const conditions = [];
  
  if (filters.customerId) {
    conditions.push(eq(orders.customerId, filters.customerId));
  }
  
  if (filters.isPaid !== undefined) {
    conditions.push(eq(orders.isPaid, filters.isPaid));
  }
  
  if (filters.paymentType) {
    conditions.push(eq(orders.paymentType, filters.paymentType));
  }
  
  if (filters.serviceType) {
    conditions.push(eq(orders.serviceType, filters.serviceType));
  }
  
  if (filters.startDate) {
    conditions.push(gte(orders.salesStartDt, filters.startDate));
  }
  
  if (filters.endDate) {
    conditions.push(lte(orders.salesStartDt, filters.endDate));
  }
  
  if (filters.search) {
    conditions.push(
      or(
        like(orders.customerName, `%${filters.search}%`),
        like(orders.description, `%${filters.search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Apply sorting
  const sortField = sort.field === 'created' ? orders.createdAt :
                   sort.field === 'amount' ? orders.amount :
                   sort.field === 'customer' ? orders.customerName :
                   orders.paymentType;

  query = query.orderBy(sort.direction === 'desc' ? desc(sortField) : asc(sortField));

  // Apply pagination
  if (limit) {
    query = query.limit(limit);
  }
  
  if (offset > 0) {
    query = query.offset(offset);
  }

  return await query;
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
  let query = db.select({ count: orders.orderId }).from(orders);

  const conditions = [];
  
  if (filters.customerId) {
    conditions.push(eq(orders.customerId, filters.customerId));
  }
  
  if (filters.isPaid !== undefined) {
    conditions.push(eq(orders.isPaid, filters.isPaid));
  }
  
  if (filters.paymentType) {
    conditions.push(eq(orders.paymentType, filters.paymentType));
  }
  
  if (filters.serviceType) {
    conditions.push(eq(orders.serviceType, filters.serviceType));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const result = await query;
  return result.length;
}