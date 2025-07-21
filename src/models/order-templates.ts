import { db } from '@/lib/db';
import { orderTemplates } from '@/lib/db/schema';
import { eq, desc, asc, and, or, like, count } from 'drizzle-orm';

export interface OrderTemplateFilters {
  paymentType?: 'onetime' | 'subscription';
  isActive?: boolean;
  search?: string;
}

export interface OrderTemplateSortOptions {
  field: 'created' | 'amount' | 'name';
  direction: 'asc' | 'desc';
}

/**
 * Get all order templates with optional filtering and sorting
 */
export async function getOrderTemplates({
  filters = {},
  sort = { field: 'created', direction: 'desc' },
  limit,
  offset = 0
}: {
  filters?: OrderTemplateFilters;
  sort?: OrderTemplateSortOptions;
  limit?: number;
  offset?: number;
} = {}) {
  try {
    let query = db
      .select()
      .from(orderTemplates);

    // Apply filters
    const conditions = [];
    
    if (filters.paymentType) {
      conditions.push(eq(orderTemplates.paymentType, filters.paymentType));
    }
    
    if (filters.isActive !== undefined) {
      conditions.push(eq(orderTemplates.isActive, filters.isActive));
    }
    
    if (filters.search) {
      conditions.push(
        or(
          like(orderTemplates.templateName, `%${filters.search}%`),
          like(orderTemplates.description, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    // Apply sorting
    const sortField = sort.field === 'created' ? orderTemplates.createdAt :
                     sort.field === 'amount' ? orderTemplates.amount :
                     orderTemplates.templateName;

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
 * Get a single order template by ID
 */
export async function getOrderTemplateById(templateId: string) {
  const result = await db
    .select()
    .from(orderTemplates)
    .where(eq(orderTemplates.templateId, templateId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Create a new order template
 */
export async function createOrderTemplate(templateData: typeof orderTemplates.$inferInsert) {
  const result = await db
    .insert(orderTemplates)
    .values(templateData)
    .returning();
  
  return result[0];
}

/**
 * Update an existing order template
 */
export async function updateOrderTemplate(templateId: string, templateData: Partial<typeof orderTemplates.$inferInsert>) {
  const result = await db
    .update(orderTemplates)
    .set({
      ...templateData,
      updatedAt: new Date()
    })
    .where(eq(orderTemplates.templateId, templateId))
    .returning();
  
  return result[0] || null;
}

/**
 * Delete an order template
 */
export async function deleteOrderTemplate(templateId: string) {
  const result = await db
    .delete(orderTemplates)
    .where(eq(orderTemplates.templateId, templateId))
    .returning();
  
  return result[0] || null;
}

/**
 * Get order template count
 */
export async function getOrderTemplateCount(filters: OrderTemplateFilters = {}) {
  let query = db
    .select({ count: count() })
    .from(orderTemplates);

  const conditions = [];
  
  if (filters.paymentType) {
    conditions.push(eq(orderTemplates.paymentType, filters.paymentType));
  }
  
  if (filters.isActive !== undefined) {
    conditions.push(eq(orderTemplates.isActive, filters.isActive));
  }
  
  if (filters.search) {
    conditions.push(
      or(
        like(orderTemplates.templateName, `%${filters.search}%`),
        like(orderTemplates.description, `%${filters.search}%`)
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
 * Get order templates summary
 */
export async function getOrderTemplatesSummary() {
  try {
    const [totalCountResult, activeCountResult, inactiveCountResult] = await Promise.all([
      db.select({ count: count() }).from(orderTemplates),
      db.select({ count: count() }).from(orderTemplates).where(eq(orderTemplates.isActive, true)),
      db.select({ count: count() }).from(orderTemplates).where(eq(orderTemplates.isActive, false))
    ]);

    return {
      totalCount: Number(totalCountResult[0]?.count || 0),
      activeCount: Number(activeCountResult[0]?.count || 0),
      inactiveCount: Number(inactiveCountResult[0]?.count || 0)
    };
  } catch (error) {
    throw error;
  }
}