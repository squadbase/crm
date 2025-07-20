import { db } from './index';
import { customers, orders, subscriptions, subscriptionAmounts, subscriptionPaid, orderTemplates } from './schema';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await db.delete(subscriptionPaid);
    await db.delete(subscriptionAmounts);
    await db.delete(subscriptions);
    await db.delete(orders);
    await db.delete(orderTemplates);
    await db.delete(customers);

    // Insert customers
    console.log('🏢 Inserting customers...');
    const [customer1, customer2, customer3, customer4, customer5] = await db.insert(customers).values([
      {
        customerName: '株式会社テックソリューションズ',
      },
      {
        customerName: '株式会社マーケティングプロ',
      },
      {
        customerName: '株式会社スタートアップイノベーションズ',
      },
      {
        customerName: '株式会社コンサルティングファーム',
      },
      {
        customerName: '株式会社Eコマースプラス',
      },
    ]).returning();

    // Insert onetime orders
    console.log('💼 Inserting onetime orders...');
    await db.insert(orders).values([
      {
        customerId: customer1.customerId,
        amount: '500000.00',
        salesAt: new Date('2025-06-15'),
        isPaid: true,
        description: 'CRMシステム導入プロジェクト',
      },
      {
        customerId: customer4.customerId,
        amount: '800000.00',
        salesAt: new Date('2025-05-20'),
        isPaid: true,
        description: 'マーケティングオートメーション構築',
      },
      {
        customerId: customer5.customerId,
        amount: '1200000.00',
        salesAt: new Date('2025-07-10'),
        isPaid: false,
        description: 'Eコマースプラットフォーム開発',
      },
      {
        customerId: customer2.customerId,
        amount: '600000.00',
        salesAt: new Date('2025-04-25'),
        isPaid: true,
        description: 'データ分析ダッシュボード構築',
      },
      {
        customerId: customer3.customerId,
        amount: '300000.00',
        salesAt: new Date('2025-06-05'),
        isPaid: true,
        description: 'ウェブサイトリニューアル',
      },
    ]);

    // Insert subscriptions
    console.log('📅 Inserting subscriptions...');
    const [sub1, sub2, sub3, sub4, sub5] = await db.insert(subscriptions).values([
      {
        customerId: customer1.customerId,
        description: 'プロダクト月額プラン - スタンダード',
      },
      {
        customerId: customer2.customerId,
        description: 'プロダクト月額プラン - プロフェッショナル',
      },
      {
        customerId: customer3.customerId,
        description: 'プロダクト月額プラン - ベーシック',
      },
      {
        customerId: customer4.customerId,
        description: 'プロダクト月額プラン - エンタープライズ',
      },
      {
        customerId: customer5.customerId,
        description: 'プロダクト月額プラン - プロフェッショナル',
      },
    ]).returning();

    // Insert subscription amounts (pricing history)
    console.log('💰 Inserting subscription amounts...');
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
    console.log('💳 Inserting subscription payments...');
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
    console.log('📋 Inserting order templates...');
    await db.insert(orderTemplates).values([
      // Subscription templates
      {
        paymentType: 'subscription',
        templateName: 'ベーシックプラン',
        amount: '30000.00',
        description: 'プロダクト月額プラン - ベーシック（基本機能のみ）',
      },
      {
        paymentType: 'subscription',
        templateName: 'スタンダードプラン',
        amount: '50000.00',
        description: 'プロダクト月額プラン - スタンダード（標準機能）',
      },
      {
        paymentType: 'subscription',
        templateName: 'プロフェッショナルプラン',
        amount: '80000.00',
        description: 'プロダクト月額プラン - プロフェッショナル（高機能）',
      },
      {
        paymentType: 'subscription',
        templateName: 'エンタープライズプラン',
        amount: '100000.00',
        description: 'プロダクト月額プラン - エンタープライズ（全機能）',
      },

      // Onetime templates
      {
        paymentType: 'onetime',
        templateName: '導入サポート',
        amount: '200000.00',
        description: 'プロダクト導入時の初期設定・サポート',
      },
      {
        paymentType: 'onetime',
        templateName: 'カスタマイズ開発',
        amount: '500000.00',
        description: 'プロダクトの特別カスタマイズ開発',
      },
      {
        paymentType: 'onetime',
        templateName: 'ウェブサイト制作',
        amount: '300000.00',
        description: 'コーポレートサイト・LP制作',
      },
      {
        paymentType: 'onetime',
        templateName: 'システム開発（小規模）',
        amount: '500000.00',
        description: '小規模なシステム開発・改修',
      },
      {
        paymentType: 'onetime',
        templateName: 'システム開発（中規模）',
        amount: '800000.00',
        description: '中規模なシステム開発・新機能追加',
      },
      {
        paymentType: 'onetime',
        templateName: 'システム開発（大規模）',
        amount: '1200000.00',
        description: '大規模なシステム開発・プラットフォーム構築',
      },
      {
        paymentType: 'onetime',
        templateName: 'コンサルティング',
        amount: '600000.00',
        description: 'IT戦略・システム設計コンサルティング',
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
    console.log('- Onetime orders: 5件 (¥3,400,000)');
    console.log('- Subscription revenue (July): ¥340,000');
    console.log('- Total current month revenue: ¥3,740,000');
    console.log('');
    console.log('📋 Template Summary:');
    console.log('- Subscription templates: 4件');
    console.log('- Onetime templates: 7件');

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