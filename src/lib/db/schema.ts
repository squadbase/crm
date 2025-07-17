import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  decimal,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const paymentTypeEnum = pgEnum('payment_type', [
  'onetime',
  'subscription',
]);
export const serviceTypeEnum = pgEnum('service_type', ['squadbase', 'project']);

// Customers table
export const customers = pgTable('customers', {
  customerId: uuid('customer_id').defaultRandom().primaryKey(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Orders table
export const orders = pgTable('orders', {
  orderId: uuid('order_id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id')
    .references(() => customers.customerId)
    .notNull(),
  paymentType: paymentTypeEnum('payment_type').notNull(),
  serviceType: serviceTypeEnum('service_type').notNull(),
  salesStartDt: date('sales_start_dt').notNull(),
  salesEndDt: date('sales_end_dt'),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  isPaid: boolean('is_paid').notNull().default(false),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.customerId],
  }),
}));
