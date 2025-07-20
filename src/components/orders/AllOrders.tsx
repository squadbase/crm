import { db } from '@/lib/db';
import { orders, customers } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { OrdersTable } from './OrdersTable';

export async function AllOrders() {
  const allOrders = await db
    .select({
      orderId: orders.orderId,
      customerName: customers.customerName,
      customerId: customers.customerId,
      amount: orders.amount,
      isPaid: orders.isPaid,
      salesAt: orders.salesAt,
      description: orders.description,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.customerId))
    .orderBy(desc(orders.createdAt));

  return <OrdersTable data={allOrders} />;
}