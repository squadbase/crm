import { db } from '@/lib/db';
import { orders, subscriptionPaid, customers, subscriptions } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export interface UnpaidPayment {
  id: string;
  type: 'onetime' | 'subscription';
  customerName: string;
  amount: string;
  description: string;
  salesDate: string;
  dueDate: string;
  isPaid: boolean;
  serviceType: string;
  paymentType: string;
  createdAt: string;
  subscriptionId?: string;
  year?: number;
  month?: number;
}

/**
 * Get unpaid payments (both onetime orders and subscription payments)
 */
export async function getUnpaidPayments(): Promise<{
  unpaidPayments: UnpaidPayment[];
  totalCount: number;
  totalAmount: number;
  currentMonthStart: string;
}> {
  try {
    // Get current date for filtering
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today for comparison
    
    // Current month start for reference
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // 1. Get unpaid onetime orders
    const unpaidOnetimeOrders = await db
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
      .where(eq(orders.isPaid, false))
      .orderBy(desc(orders.salesAt));

    // Format onetime orders with due date = sales_at date
    const formattedOnetimeOrders: UnpaidPayment[] = unpaidOnetimeOrders.map((order) => ({
      id: order.orderId,
      type: 'onetime' as const,
      customerName: order.customerName || 'Unknown Customer',
      amount: order.amount.toString(),
      description: order.description || 'Onetime Order',
      salesDate: order.salesAt instanceof Date ? order.salesAt.toISOString().split('T')[0] : order.salesAt,
      dueDate: order.salesAt instanceof Date ? order.salesAt.toISOString().split('T')[0] : order.salesAt,
      isPaid: order.isPaid,
      serviceType: 'onetime',
      paymentType: 'onetime',
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
    }));

    // 2. Get unpaid subscription payments
    const unpaidSubscriptionPayments = await db
      .select({
        subscriptionId: subscriptionPaid.subscriptionId,
        customerId: subscriptions.customerId,
        customerName: customers.customerName,
        amount: subscriptionPaid.amount,
        year: subscriptionPaid.year,
        month: subscriptionPaid.month,
        isPaid: subscriptionPaid.isPaid,
        description: subscriptions.description,
        createdAt: subscriptionPaid.createdAt,
        updatedAt: subscriptionPaid.updatedAt,
      })
      .from(subscriptionPaid)
      .leftJoin(subscriptions, eq(subscriptionPaid.subscriptionId, subscriptions.subscriptionId))
      .leftJoin(customers, eq(subscriptions.customerId, customers.customerId))
      .where(eq(subscriptionPaid.isPaid, false))
      .orderBy(desc(subscriptionPaid.year), desc(subscriptionPaid.month));

    // Format subscription payments with due date = end of month
    const formattedSubscriptionPayments: UnpaidPayment[] = unpaidSubscriptionPayments.map((payment) => {
      // Due date is the end of the payment month
      const dueDate = new Date(payment.year, payment.month, 0); // Last day of the month
      const salesDate = new Date(payment.year, payment.month - 1, 1); // First day of the month

      return {
        id: `${payment.subscriptionId}-${payment.year}-${payment.month}`,
        type: 'subscription' as const,
        customerName: payment.customerName || 'Unknown Customer',
        amount: payment.amount.toString(),
        description: payment.description || `Subscription Payment ${payment.year}/${payment.month}`,
        salesDate: salesDate.toISOString().split('T')[0],
        dueDate: `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`,
        isPaid: payment.isPaid,
        serviceType: 'subscription',
        paymentType: 'subscription',
        createdAt: payment.createdAt instanceof Date ? payment.createdAt.toISOString() : payment.createdAt,
        subscriptionId: payment.subscriptionId,
        year: payment.year,
        month: payment.month,
      };
    });

    // Combine both arrays and sort by due date (ascending)
    // Show all unpaid payments regardless of due date
    const allUnpaidPayments = [
      ...formattedOnetimeOrders,
      ...formattedSubscriptionPayments
    ]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    // Calculate total amount
    const totalAmount = allUnpaidPayments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount);
    }, 0);

    return {
      unpaidPayments: allUnpaidPayments,
      totalCount: allUnpaidPayments.length,
      totalAmount,
      currentMonthStart: currentMonthStart.toISOString().split('T')[0],
    };
  } catch (error) {
    // Error occurred while fetching unpaid payments
    throw error;
  }
}

/**
 * Update payment status for multiple items
 */
export async function updatePaymentStatus(items: Array<{
  id: string;
  type: 'onetime' | 'subscription';
  subscriptionId?: string;
  year?: number;
  month?: number;
}>) {
  try {
    const results = [];
    
    for (const item of items) {
      if (item.type === 'onetime') {
        // Update onetime order
        const result = await db
          .update(orders)
          .set({ isPaid: true })
          .where(eq(orders.orderId, item.id))
          .returning();
        results.push({ type: 'onetime', result });
      } else if (item.type === 'subscription' && item.subscriptionId && item.year && item.month) {
        // Update subscription payment
        const result = await db
          .update(subscriptionPaid)
          .set({ isPaid: true })
          .where(
            and(
              eq(subscriptionPaid.subscriptionId, item.subscriptionId),
              eq(subscriptionPaid.year, item.year),
              eq(subscriptionPaid.month, item.month)
            )
          )
          .returning();
        results.push({ type: 'subscription', result });
      }
    }
    
    return results;
  } catch (error) {
    // Error occurred while updating payment status
    throw error;
  }
}