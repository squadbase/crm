import { db } from '@/lib/db';
import {
  subscriptions,
  subscriptionPaid,
  subscriptionAmounts,
  customers,
} from '@/lib/db/schema';
import { eq, desc, asc, and, or, like, count, sql, isNull } from 'drizzle-orm';

export interface SubscriptionFilters {
  customerId?: string;
  search?: string;
}

export interface SubscriptionSortOptions {
  field: 'created' | 'customer' | 'startDate';
  direction: 'asc' | 'desc';
}

/**
 * Get all subscriptions with optional filtering and sorting
 */
export async function getSubscriptions({
  filters = {},
  sort = { field: 'startDate', direction: 'desc' },
  limit,
  offset = 0,
}: {
  filters?: SubscriptionFilters;
  sort?: SubscriptionSortOptions;
  limit?: number;
  offset?: number;
} = {}) {
  try {
    let query = db
      .select({
        subscriptionId: subscriptions.subscriptionId,
        customerId: subscriptions.customerId,
        customerName: customers.customerName,
        description: subscriptions.description,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        startDate: subscriptionAmounts.startDate,
      })
      .from(subscriptions)
      .leftJoin(customers, eq(subscriptions.customerId, customers.customerId))
      .leftJoin(
        subscriptionAmounts,
        eq(subscriptions.subscriptionId, subscriptionAmounts.subscriptionId),
      );

    // Apply filters
    const conditions = [];

    if (filters.customerId) {
      conditions.push(eq(subscriptions.customerId, filters.customerId));
    }

    if (filters.search) {
      conditions.push(
        or(
          like(customers.customerName, `%${filters.search}%`),
          like(subscriptions.description, `%${filters.search}%`),
        ),
      );
    }

    if (conditions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).where(
        conditions.length === 1 ? conditions[0] : and(...conditions),
      );
    }

    // Apply sorting
    const sortField =
      sort.field === 'created'
        ? subscriptions.createdAt
        : sort.field === 'customer'
        ? customers.customerName
        : subscriptionAmounts.startDate;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).orderBy(
      sort.direction === 'desc' ? desc(sortField) : asc(sortField),
    );

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
 * Get a single subscription by ID
 */
export async function getSubscriptionById(subscriptionId: string) {
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.subscriptionId, subscriptionId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get subscription with payment details
 */
export async function getSubscriptionWithPaymentDetails(
  subscriptionId: string,
) {
  try {
    // Get subscription with customer details
    const subscriptionQuery = await db
      .select({
        subscriptionId: subscriptions.subscriptionId,
        customerId: subscriptions.customerId,
        customerName: customers.customerName,
        description: subscriptions.description,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
      })
      .from(subscriptions)
      .leftJoin(customers, eq(subscriptions.customerId, customers.customerId))
      .where(eq(subscriptions.subscriptionId, subscriptionId))
      .limit(1);

    const subscription = subscriptionQuery[0];
    if (!subscription) {
      return null;
    }

    // Get subscription amounts
    const amounts = await db
      .select()
      .from(subscriptionAmounts)
      .where(eq(subscriptionAmounts.subscriptionId, subscriptionId))
      .orderBy(desc(subscriptionAmounts.startDate));

    // Get payment history
    const paymentsRaw = await db
      .select()
      .from(subscriptionPaid)
      .where(eq(subscriptionPaid.subscriptionId, subscriptionId))
      .orderBy(desc(subscriptionPaid.year), desc(subscriptionPaid.month));

    // Convert payment amounts from strings to numbers
    const payments = paymentsRaw.map((payment) => ({
      ...payment,
      amount: parseFloat(payment.amount),
    }));

    // Calculate current amount and status from amounts data based on current date
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format

    const currentAmountRecord = amounts.find((a) => {
      const startDate = a.startDate;
      const endDate = a.endDate;

      // Start date <= current date AND (no end date OR end date > current date)
      return startDate <= today && (!endDate || endDate > today);
    });

    const currentAmount = currentAmountRecord
      ? parseFloat(currentAmountRecord.amount)
      : 0;
    const status = currentAmountRecord ? 'active' : 'inactive';

    // Add calculated fields to subscription
    const subscriptionWithMetrics = {
      ...subscription,
      currentAmount,
      status,
      totalPaid: payments
        .filter((p) => p.isPaid)
        .reduce((sum, p) => sum + p.amount, 0),
      totalUnpaid: payments
        .filter((p) => !p.isPaid)
        .reduce((sum, p) => sum + p.amount, 0),
    };

    return {
      subscription: subscriptionWithMetrics,
      amounts,
      payments,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Create a new subscription
 */
export async function createSubscription(
  subscriptionData: typeof subscriptions.$inferInsert,
) {
  const result = await db
    .insert(subscriptions)
    .values(subscriptionData)
    .returning();

  return result[0];
}

/**
 * Update an existing subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  subscriptionData: Partial<typeof subscriptions.$inferInsert>,
) {
  const result = await db
    .update(subscriptions)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.subscriptionId, subscriptionId))
    .returning();

  return result[0] || null;
}

/**
 * Delete a subscription
 */
export async function deleteSubscription(subscriptionId: string) {
  const result = await db
    .delete(subscriptions)
    .where(eq(subscriptions.subscriptionId, subscriptionId))
    .returning();

  return result[0] || null;
}

/**
 * Get subscription count
 */
export async function getSubscriptionCount(filters: SubscriptionFilters = {}) {
  let query = db
    .select({ count: count() })
    .from(subscriptions)
    .leftJoin(customers, eq(subscriptions.customerId, customers.customerId));

  const conditions = [];

  if (filters.customerId) {
    conditions.push(eq(subscriptions.customerId, filters.customerId));
  }

  if (filters.search) {
    conditions.push(
      or(
        like(customers.customerName, `%${filters.search}%`),
        like(subscriptions.description, `%${filters.search}%`),
      ),
    );
  }

  if (conditions.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).where(
      conditions.length === 1 ? conditions[0] : and(...conditions),
    );
  }

  const result = await query;
  return Number(result[0]?.count || 0);
}

/**
 * Get subscription payment summary for a specific subscription
 */
export async function getSubscriptionPaymentSummary(subscriptionId: string) {
  try {
    const result = await db
      .select({
        paidAmount: sql<string>`SUM(CASE WHEN ${subscriptionPaid.isPaid} = true THEN ${subscriptionPaid.amount} ELSE 0 END)`,
        unpaidAmount: sql<string>`SUM(CASE WHEN ${subscriptionPaid.isPaid} = false THEN ${subscriptionPaid.amount} ELSE 0 END)`,
        totalAmount: sql<string>`SUM(${subscriptionPaid.amount})`,
        totalPayments: sql<string>`count(DISTINCT ${subscriptionPaid.subscriptionId})`,
      })
      .from(subscriptionPaid)
      .where(eq(subscriptionPaid.subscriptionId, subscriptionId));

    const summary = result[0];
    return {
      paidAmount: parseFloat(summary?.paidAmount || '0'),
      unpaidAmount: parseFloat(summary?.unpaidAmount || '0'),
      totalAmount: parseFloat(summary?.totalAmount || '0'),
      totalPayments: parseInt(summary?.totalPayments || '0'),
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get subscription summary metrics
 */
export async function getSubscriptionSummaryMetrics() {
  try {
    // Monthly revenue (sum of all active subscription amounts based on current date)
    const monthlyRevenueResult = await db
      .select({
        totalAmount: sql<string>`SUM(${subscriptionAmounts.amount})`,
      })
      .from(subscriptionAmounts)
      .where(
        and(
          sql`${subscriptionAmounts.startDate} <= CURRENT_DATE`, // Start date is today or in the past
          or(
            isNull(subscriptionAmounts.endDate), // No end date (ongoing)
            sql`${subscriptionAmounts.endDate} > CURRENT_DATE`, // Or end date is in the future
          ),
        ),
      );

    // Total unpaid amount (all unpaid subscription payments)
    const totalUnpaidResult = await db
      .select({
        totalUnpaid: sql<string>`SUM(${subscriptionPaid.amount})`,
      })
      .from(subscriptionPaid)
      .where(eq(subscriptionPaid.isPaid, false));

    // Average continuation months
    const continuationMonthsResult = await db
      .select({
        subscriptionId: subscriptions.subscriptionId,
        startDate: sql<string>`MIN(${subscriptionAmounts.startDate})`,
        endDate: sql<string>`MAX(${subscriptionAmounts.endDate})`,
      })
      .from(subscriptions)
      .leftJoin(
        subscriptionAmounts,
        eq(subscriptions.subscriptionId, subscriptionAmounts.subscriptionId),
      )
      .groupBy(subscriptions.subscriptionId);

    // Calculate average continuation months
    let totalMonths = 0;
    let subscriptionCount = 0;
    const currentDate = new Date();

    for (const sub of continuationMonthsResult) {
      if (sub.startDate) {
        const startDate = new Date(sub.startDate);
        const endDate = sub.endDate ? new Date(sub.endDate) : currentDate;

        // Calculate month difference
        const monthDiff =
          (endDate.getFullYear() - startDate.getFullYear()) * 12 +
          (endDate.getMonth() - startDate.getMonth()) +
          1;

        totalMonths += monthDiff;
        subscriptionCount++;
      }
    }

    const averageContinuationMonths =
      subscriptionCount > 0 ? totalMonths / subscriptionCount : 0;
    const totalMonthlyRevenue = monthlyRevenueResult[0]?.totalAmount || '0';
    const totalUnpaid = totalUnpaidResult[0]?.totalUnpaid || '0';

    return {
      totalMonthlyRevenue,
      totalUnpaid,
      averageContinuationMonths,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Create a new subscription amount
 */
export async function createSubscriptionAmount(amountData: {
  subscriptionId: string;
  amount: string;
  startDate: string;
  endDate?: string | null;
}) {
  try {
    const [subscriptionAmount] = await db
      .insert(subscriptionAmounts)
      .values({
        subscriptionId: amountData.subscriptionId,
        amount: amountData.amount,
        startDate: amountData.startDate,
        endDate: amountData.endDate || null,
      })
      .returning();

    return {
      amountId: subscriptionAmount.amountId,
      subscriptionId: subscriptionAmount.subscriptionId,
      amount: parseFloat(subscriptionAmount.amount),
      startDate: subscriptionAmount.startDate,
      endDate: subscriptionAmount.endDate,
      createdAt: subscriptionAmount.createdAt
        ? new Date(subscriptionAmount.createdAt).toISOString()
        : null,
      updatedAt: subscriptionAmount.updatedAt
        ? new Date(subscriptionAmount.updatedAt).toISOString()
        : null,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Update a subscription amount
 */
export async function updateSubscriptionAmount(
  amountId: string,
  updateData: {
    amount?: string;
    startDate?: string;
    endDate?: string | null;
  },
) {
  try {
    const [updatedAmount] = await db
      .update(subscriptionAmounts)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionAmounts.amountId, amountId))
      .returning();

    if (!updatedAmount) return null;

    return {
      amountId: updatedAmount.amountId,
      subscriptionId: updatedAmount.subscriptionId,
      amount: parseFloat(updatedAmount.amount),
      startDate: updatedAmount.startDate,
      endDate: updatedAmount.endDate,
      createdAt: updatedAmount.createdAt
        ? new Date(updatedAmount.createdAt).toISOString()
        : null,
      updatedAt: updatedAmount.updatedAt
        ? new Date(updatedAmount.updatedAt).toISOString()
        : null,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a subscription amount
 */
export async function deleteSubscriptionAmount(amountId: string) {
  try {
    const [deletedAmount] = await db
      .delete(subscriptionAmounts)
      .where(eq(subscriptionAmounts.amountId, amountId))
      .returning();

    return deletedAmount || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Create a subscription payment record
 */
export async function createSubscriptionPayment(paymentData: {
  subscriptionId: string;
  year: number;
  month: number;
  amount: string;
  isPaid?: boolean;
}) {
  try {
    const [payment] = await db
      .insert(subscriptionPaid)
      .values({
        subscriptionId: paymentData.subscriptionId,
        year: paymentData.year,
        month: paymentData.month,
        amount: paymentData.amount,
        isPaid: paymentData.isPaid ?? false,
      })
      .returning();

    return {
      paidId: payment.paidId,
      subscriptionId: payment.subscriptionId,
      year: payment.year,
      month: payment.month,
      amount: parseFloat(payment.amount),
      isPaid: payment.isPaid,
      createdAt: payment.createdAt
        ? new Date(payment.createdAt).toISOString()
        : null,
      updatedAt: payment.updatedAt
        ? new Date(payment.updatedAt).toISOString()
        : null,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Update a subscription payment
 */
export async function updateSubscriptionPayment(
  paidId: string,
  updateData: {
    amount?: string;
    isPaid?: boolean;
  },
) {
  try {
    const [updatedPayment] = await db
      .update(subscriptionPaid)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionPaid.paidId, paidId))
      .returning();

    if (!updatedPayment) return null;

    return {
      paidId: updatedPayment.paidId,
      subscriptionId: updatedPayment.subscriptionId,
      year: updatedPayment.year,
      month: updatedPayment.month,
      amount: parseFloat(updatedPayment.amount),
      isPaid: updatedPayment.isPaid,
      createdAt: updatedPayment.createdAt
        ? new Date(updatedPayment.createdAt).toISOString()
        : null,
      updatedAt: updatedPayment.updatedAt
        ? new Date(updatedPayment.updatedAt).toISOString()
        : null,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a subscription payment
 */
export async function deleteSubscriptionPayment(paidId: string) {
  try {
    const [deletedPayment] = await db
      .delete(subscriptionPaid)
      .where(eq(subscriptionPaid.paidId, paidId))
      .returning();

    return deletedPayment || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Get subscription amounts for a specific subscription
 */
export async function getSubscriptionAmounts(subscriptionId: string) {
  try {
    const amounts = await db
      .select({
        amountId: subscriptionAmounts.amountId,
        subscriptionId: subscriptionAmounts.subscriptionId,
        amount: subscriptionAmounts.amount,
        startDate: subscriptionAmounts.startDate,
        endDate: subscriptionAmounts.endDate,
        createdAt: subscriptionAmounts.createdAt,
        updatedAt: subscriptionAmounts.updatedAt,
      })
      .from(subscriptionAmounts)
      .where(eq(subscriptionAmounts.subscriptionId, subscriptionId))
      .orderBy(asc(subscriptionAmounts.startDate));

    return amounts.map((amount) => ({
      ...amount,
      amount: parseFloat(amount.amount),
    }));
  } catch (error) {
    throw error;
  }
}

/**
 * Get subscription payments for a specific subscription
 */
export async function getSubscriptionPayments(subscriptionId: string) {
  try {
    const payments = await db
      .select()
      .from(subscriptionPaid)
      .where(eq(subscriptionPaid.subscriptionId, subscriptionId))
      .orderBy(desc(subscriptionPaid.year), desc(subscriptionPaid.month));

    return payments.map((payment) => ({
      paidId: payment.paidId,
      subscriptionId: payment.subscriptionId,
      year: payment.year,
      month: payment.month,
      amount: parseFloat(payment.amount),
      isPaid: payment.isPaid,
      createdAt: payment.createdAt
        ? new Date(payment.createdAt).toISOString()
        : null,
      updatedAt: payment.updatedAt
        ? new Date(payment.updatedAt).toISOString()
        : null,
    }));
  } catch (error) {
    throw error;
  }
}

/**
 * Calculate and update subscription payments for a date range or specific month
 */
export async function calculateAndUpdateMonthlyPayments(
  startYear: number,
  startMonth: number,
  endYear?: number,
  endMonth?: number,
) {
  const finalEndYear = endYear ?? startYear;
  const finalEndMonth = endMonth ?? startMonth;
  
  try {
    // Calculate monthly payments for specified date range

    // Get all active subscriptions with their amounts
    const subscriptionsWithAmounts = await db
      .select({
        subscriptionId: subscriptions.subscriptionId,
        customerId: subscriptions.customerId,
        description: subscriptions.description,
        amountId: subscriptionAmounts.amountId,
        amount: subscriptionAmounts.amount,
        startDate: subscriptionAmounts.startDate,
        endDate: subscriptionAmounts.endDate,
      })
      .from(subscriptions)
      .innerJoin(
        subscriptionAmounts,
        eq(subscriptions.subscriptionId, subscriptionAmounts.subscriptionId),
      )
      .orderBy(
        subscriptions.subscriptionId,
        desc(subscriptionAmounts.startDate),
      );

    // Group amounts by subscription
    const subscriptionAmountGroups = subscriptionsWithAmounts.reduce(
      (acc, row) => {
        if (!acc[row.subscriptionId]) {
          acc[row.subscriptionId] = [];
        }
        acc[row.subscriptionId].push(row);
        return acc;
      },
      {} as Record<string, typeof subscriptionsWithAmounts>,
    );

    // Generate list of months to process
    const monthsToProcess = [];
    let currentYear = startYear;
    let currentMonth = startMonth;
    
    while (currentYear < finalEndYear || (currentYear === finalEndYear && currentMonth <= finalEndMonth)) {
      monthsToProcess.push({ year: currentYear, month: currentMonth });
      
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    // Process each month in the specified range

    const results = [];

    // Process each month in the range
    for (const { year, month } of monthsToProcess) {
      const targetDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      
      for (const [subscriptionId, amounts] of Object.entries(
        subscriptionAmountGroups,
      )) {
        // Find the applicable amount for the target month
        const applicableAmount = amounts.find((a) => {
          const startDate = a.startDate;
          const endDate = a.endDate;

          // Check if the target date falls within the amount period
          return startDate <= targetDate && (!endDate || endDate >= targetDate);
        });

        if (!applicableAmount) {
          // Skip subscription if no applicable amount found for this month
          continue;
        }

        const monthlyAmount = parseFloat(applicableAmount.amount);

        // Check if payment record already exists for this subscription, year, and month
        const existingPayment = await db
          .select()
          .from(subscriptionPaid)
          .where(
            and(
              eq(subscriptionPaid.subscriptionId, subscriptionId),
              eq(subscriptionPaid.year, year),
              eq(subscriptionPaid.month, month),
            ),
          )
          .limit(1);

        if (existingPayment.length > 0) {
          const existing = existingPayment[0];
          const existingAmount = parseFloat(existing.amount);

          if (existing.isPaid && existingAmount !== monthlyAmount) {
            // Create difference record for paid payments with amount changes
            const differenceAmount = monthlyAmount - existingAmount;

            if (differenceAmount !== 0) {
              await db.insert(subscriptionPaid).values({
                subscriptionId,
                year,
                month,
                amount: differenceAmount.toFixed(2),
                isPaid: false, // New difference record starts as unpaid
              });

              results.push({
                subscriptionId,
                year,
                month,
                action: 'created_difference',
                amount: differenceAmount,
                originalAmount: existingAmount,
                newAmount: monthlyAmount,
              });
            }
          } else if (!existing.isPaid) {
            // Update unpaid record with latest amount
            await db
              .update(subscriptionPaid)
              .set({
                amount: monthlyAmount.toFixed(2),
                updatedAt: new Date(),
              })
              .where(eq(subscriptionPaid.paidId, existing.paidId));

            results.push({
              subscriptionId,
              year,
              month,
              action: 'updated',
              amount: monthlyAmount,
              previousAmount: existingAmount,
            });
          } else {
            // Paid record with same amount - no action needed
            results.push({
              subscriptionId,
              year,
              month,
              action: 'no_change',
              amount: monthlyAmount,
            });
          }
        } else {
          // Create new payment record
          await db.insert(subscriptionPaid).values({
            subscriptionId,
            year,
            month,
            amount: monthlyAmount.toFixed(2),
            isPaid: false,
          });

          results.push({
            subscriptionId,
            year,
            month,
            action: 'created',
            amount: monthlyAmount,
          });
        }
      }
    }

    // Monthly payment calculation completed successfully

    return {
      startYear,
      startMonth,
      endYear: finalEndYear,
      endMonth: finalEndMonth,
      monthsProcessed: monthsToProcess.length,
      processedCount: results.length,
      results,
    };
  } catch (error) {
    // Error occurred during monthly payment calculation
    throw error;
  }
}
