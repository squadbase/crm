import { db } from './index';
import { customers, orders, subscriptions, subscriptionAmounts, subscriptionPaid, orderTemplates } from './schema';

async function seed() {
  try {
    // Clear existing data
    await db.delete(subscriptionPaid);
    await db.delete(subscriptionAmounts);
    await db.delete(subscriptions);
    await db.delete(orders);
    await db.delete(orderTemplates);
    await db.delete(customers);

    // Insert customers
    const [customer1, customer2, customer3, customer4, customer5] = await db.insert(customers).values([
      {
        customerName: 'TechSolutions Inc.',
      },
      {
        customerName: 'Marketing Pro Corp.',
      },
      {
        customerName: 'Startup Innovations LLC',
      },
      {
        customerName: 'Consulting Firm Ltd.',
      },
      {
        customerName: 'E-Commerce Plus Co.',
      },
    ]).returning();

    // Insert onetime orders
    await db.insert(orders).values([
      {
        customerId: customer1.customerId,
        amount: '500000.00',
        salesAt: new Date('2025-06-15'),
        isPaid: true,
        description: 'CRM System Implementation Project',
      },
      {
        customerId: customer4.customerId,
        amount: '800000.00',
        salesAt: new Date('2025-05-20'),
        isPaid: true,
        description: 'Marketing Automation Platform Development',
      },
      {
        customerId: customer5.customerId,
        amount: '1200000.00',
        salesAt: new Date('2025-07-10'),
        isPaid: false,
        description: 'E-commerce Platform Development',
      },
      {
        customerId: customer2.customerId,
        amount: '600000.00',
        salesAt: new Date('2025-04-25'),
        isPaid: true,
        description: 'Data Analytics Dashboard Development',
      },
      {
        customerId: customer3.customerId,
        amount: '300000.00',
        salesAt: new Date('2025-06-05'),
        isPaid: true,
        description: 'Website Redesign and Development',
      },
    ]);

    // Insert subscriptions
    const [sub1, sub2, sub3, sub4, sub5] = await db.insert(subscriptions).values([
      {
        customerId: customer1.customerId,
        description: 'Monthly Product Plan - Standard',
      },
      {
        customerId: customer2.customerId,
        description: 'Monthly Product Plan - Professional',
      },
      {
        customerId: customer3.customerId,
        description: 'Monthly Product Plan - Basic',
      },
      {
        customerId: customer4.customerId,
        description: 'Monthly Product Plan - Enterprise',
      },
      {
        customerId: customer5.customerId,
        description: 'Monthly Product Plan - Professional',
      },
    ]).returning();

    // Insert subscription amounts (pricing history)
    await db.insert(subscriptionAmounts).values([
      // Subscription 1 - Standard plan
      {
        subscriptionId: sub1.subscriptionId,
        amount: '50000.00',
        startDate: '2025-04-01',
        endDate: null, // ongoing
      },
      // Subscription 2 - Professional plan
      {
        subscriptionId: sub2.subscriptionId,
        amount: '80000.00',
        startDate: '2025-04-15',
        endDate: null, // ongoing
      },
      // Subscription 3 - Basic plan (ended)
      {
        subscriptionId: sub3.subscriptionId,
        amount: '30000.00',
        startDate: '2025-05-01',
        endDate: '2025-12-31', // ended
      },
      // Subscription 4 - Enterprise plan
      {
        subscriptionId: sub4.subscriptionId,
        amount: '100000.00',
        startDate: '2025-06-01',
        endDate: null, // ongoing
      },
      // Subscription 5 - Professional plan
      {
        subscriptionId: sub5.subscriptionId,
        amount: '80000.00',
        startDate: '2025-06-15',
        endDate: null, // ongoing
      },
    ]);

    // Insert subscription payments
    await db.insert(subscriptionPaid).values([
      // Sub1 payments (April-July)
      { subscriptionId: sub1.subscriptionId, year: 2025, month: 4, amount: '50000.00', isPaid: true },
      { subscriptionId: sub1.subscriptionId, year: 2025, month: 5, amount: '50000.00', isPaid: true },
      { subscriptionId: sub1.subscriptionId, year: 2025, month: 6, amount: '50000.00', isPaid: true },
      { subscriptionId: sub1.subscriptionId, year: 2025, month: 7, amount: '50000.00', isPaid: true },
      
      // Sub2 payments (May-July)
      { subscriptionId: sub2.subscriptionId, year: 2025, month: 5, amount: '80000.00', isPaid: true },
      { subscriptionId: sub2.subscriptionId, year: 2025, month: 6, amount: '80000.00', isPaid: true },
      { subscriptionId: sub2.subscriptionId, year: 2025, month: 7, amount: '80000.00', isPaid: true },
      
      // Sub3 payments (May-July)
      { subscriptionId: sub3.subscriptionId, year: 2025, month: 5, amount: '30000.00', isPaid: true },
      { subscriptionId: sub3.subscriptionId, year: 2025, month: 6, amount: '30000.00', isPaid: true },
      { subscriptionId: sub3.subscriptionId, year: 2025, month: 7, amount: '30000.00', isPaid: true },
      
      // Sub4 payments (June-July)
      { subscriptionId: sub4.subscriptionId, year: 2025, month: 6, amount: '100000.00', isPaid: true },
      { subscriptionId: sub4.subscriptionId, year: 2025, month: 7, amount: '100000.00', isPaid: true },
      
      // Sub5 payments (July only)
      { subscriptionId: sub5.subscriptionId, year: 2025, month: 7, amount: '80000.00', isPaid: true },
      
      // Add some unpaid subscription payments for testing
      { subscriptionId: sub1.subscriptionId, year: 2025, month: 8, amount: '50000.00', isPaid: false },
      { subscriptionId: sub2.subscriptionId, year: 2025, month: 8, amount: '80000.00', isPaid: false },
      { subscriptionId: sub4.subscriptionId, year: 2025, month: 8, amount: '100000.00', isPaid: false },
    ]);

    // Insert order templates
    await db.insert(orderTemplates).values([
      // Subscription templates
      {
        paymentType: 'subscription',
        templateName: 'Basic Plan',
        amount: '30000.00',
        description: 'Monthly Product Plan - Basic (Essential features only)',
      },
      {
        paymentType: 'subscription',
        templateName: 'Standard Plan',
        amount: '50000.00',
        description: 'Monthly Product Plan - Standard (Standard features)',
      },
      {
        paymentType: 'subscription',
        templateName: 'Professional Plan',
        amount: '80000.00',
        description: 'Monthly Product Plan - Professional (Advanced features)',
      },
      {
        paymentType: 'subscription',
        templateName: 'Enterprise Plan',
        amount: '100000.00',
        description: 'Monthly Product Plan - Enterprise (All features)',
      },

      // Onetime templates
      {
        paymentType: 'onetime',
        templateName: 'Implementation Support',
        amount: '200000.00',
        description: 'Initial setup and support for product deployment',
      },
      {
        paymentType: 'onetime',
        templateName: 'Custom Development',
        amount: '500000.00',
        description: 'Special customization development for the product',
      },
      {
        paymentType: 'onetime',
        templateName: 'Website Development',
        amount: '300000.00',
        description: 'Corporate website and landing page development',
      },
      {
        paymentType: 'onetime',
        templateName: 'System Development (Small)',
        amount: '500000.00',
        description: 'Small-scale system development and modifications',
      },
      {
        paymentType: 'onetime',
        templateName: 'System Development (Medium)',
        amount: '800000.00',
        description: 'Medium-scale system development and new feature additions',
      },
      {
        paymentType: 'onetime',
        templateName: 'System Development (Large)',
        amount: '1200000.00',
        description: 'Large-scale system development and platform construction',
      },
      {
        paymentType: 'onetime',
        templateName: 'IT Consulting',
        amount: '600000.00',
        description: 'IT strategy and system design consulting services',
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log(`🏢 Created ${5} customers`);
    console.log(`💼 Created ${5} onetime orders`);
    console.log(`📅 Created ${5} subscriptions`);
    console.log(`💰 Created ${5} subscription amounts`);
    console.log(`💳 Created ${16} subscription payments`);
    console.log(`📋 Created ${11} order templates`);
    console.log('');
    console.log('📊 Sales Summary:');
    console.log('- Onetime orders: 5 orders (¥3,400,000)');
    console.log('- Subscription revenue (July): ¥340,000');
    console.log('- Total current month revenue: ¥3,740,000');
    console.log('');
    console.log('📋 Template Summary:');
    console.log('- Subscription templates: 4 items');
    console.log('- Onetime templates: 7 items');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };