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
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const paymentTypeEnum = pgEnum('payment_type', [
  'onetime',
  'subscription',
]);

// Customers table
export const customers = pgTable('customers', {
  customerId: uuid('customer_id').defaultRandom().primaryKey(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Orders table (onetime only)
export const orders = pgTable('orders', {
  orderId: uuid('order_id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id')
    .references(() => customers.customerId)
    .notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  salesAt: timestamp('sales_at').notNull(),
  isPaid: boolean('is_paid').notNull().default(false),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  subscriptionId: uuid('subscription_id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id')
    .references(() => customers.customerId)
    .notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscription amounts table (pricing history)
export const subscriptionAmounts = pgTable('subscription_amounts', {
  amountId: uuid('amount_id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id')
    .references(() => subscriptions.subscriptionId)
    .notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'), // NULL = ongoing
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscription paid table (monthly payment tracking)
export const subscriptionPaid = pgTable('subscription_paid', {
  paidId: uuid('paid_id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id')
    .references(() => subscriptions.subscriptionId)
    .notNull(),
  year: integer('year').notNull(),
  month: integer('month').notNull(), // 1-12
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  isPaid: boolean('is_paid').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Order templates table
export const orderTemplates = pgTable('order_templates', {
  templateId: uuid('template_id').defaultRandom().primaryKey(),
  paymentType: paymentTypeEnum('payment_type').notNull(),
  templateName: varchar('template_name', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  subscriptions: many(subscriptions),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.customerId],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  customer: one(customers, {
    fields: [subscriptions.customerId],
    references: [customers.customerId],
  }),
  amounts: many(subscriptionAmounts),
  payments: many(subscriptionPaid),
}));

export const subscriptionAmountsRelations = relations(subscriptionAmounts, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [subscriptionAmounts.subscriptionId],
    references: [subscriptions.subscriptionId],
  }),
}));

export const subscriptionPaidRelations = relations(subscriptionPaid, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [subscriptionPaid.subscriptionId],
    references: [subscriptions.subscriptionId],
  }),
}));
