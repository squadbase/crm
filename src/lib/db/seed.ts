import { db } from './index';
import { customers, orders, orderTemplates } from './schema';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
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

    // Insert orders
    console.log('💼 Inserting orders...');
    await db.insert(orders).values([
      // プロダクト サブスクリプション
      {
        customerId: customer1.customerId,
        paymentType: 'subscription',
        serviceType: 'product',
        salesStartDt: '2025-04-01',
        salesEndDt: null, // 継続中
        amount: '50000.00',
        isPaid: true,
        description: 'プロダクト月額プラン - スタンダード',
      },
      {
        customerId: customer2.customerId,
        paymentType: 'subscription',
        serviceType: 'product',
        salesStartDt: '2025-04-15',
        salesEndDt: null, // 継続中
        amount: '80000.00',
        isPaid: true,
        description: 'プロダクト月額プラン - プロフェッショナル',
      },
      {
        customerId: customer3.customerId,
        paymentType: 'subscription',
        serviceType: 'product',
        salesStartDt: '2025-05-01',
        salesEndDt: '2025-12-31',
        amount: '30000.00',
        isPaid: true,
        description: 'プロダクト月額プラン - ベーシック',
      },

      // プロジェクト案件（一回払い）
      {
        customerId: customer1.customerId,
        paymentType: 'onetime',
        serviceType: 'project',
        salesStartDt: '2025-04-10',
        salesEndDt: '2025-04-10',
        amount: '500000.00',
        isPaid: true,
        description: 'CRMシステム導入プロジェクト',
      },
      {
        customerId: customer4.customerId,
        paymentType: 'onetime',
        serviceType: 'project',
        salesStartDt: '2025-05-01',
        salesEndDt: '2025-05-01',
        amount: '800000.00',
        isPaid: true,
        description: 'マーケティングオートメーション構築',
      },
      {
        customerId: customer5.customerId,
        paymentType: 'onetime',
        serviceType: 'project',
        salesStartDt: '2025-05-15',
        salesEndDt: '2025-05-15',
        amount: '1200000.00',
        isPaid: false,
        description: 'Eコマースプラットフォーム開発',
      },

      // 追加のプロダクトサブスクリプション
      {
        customerId: customer4.customerId,
        paymentType: 'subscription',
        serviceType: 'product',
        salesStartDt: '2025-06-01',
        salesEndDt: null, // 継続中
        amount: '100000.00',
        isPaid: true,
        description: 'プロダクト月額プラン - エンタープライズ',
      },
      {
        customerId: customer5.customerId,
        paymentType: 'subscription',
        serviceType: 'product',
        salesStartDt: '2025-06-15',
        salesEndDt: null, // 継続中
        amount: '80000.00',
        isPaid: true,
        description: 'プロダクト月額プラン - プロフェッショナル',
      },

      // 7月のプロジェクト案件
      {
        customerId: customer2.customerId,
        paymentType: 'onetime',
        serviceType: 'project',
        salesStartDt: '2025-07-01',
        salesEndDt: '2025-07-01',
        amount: '600000.00',
        isPaid: true,
        description: 'データ分析ダッシュボード構築',
      },
      {
        customerId: customer3.customerId,
        paymentType: 'onetime',
        serviceType: 'project',
        salesStartDt: '2025-07-15',
        salesEndDt: '2025-07-15',
        amount: '300000.00',
        isPaid: true,
        description: 'ウェブサイトリニューアル',
      },
    ]);

    // Insert order templates
    console.log('📋 Inserting order templates...');
    await db.insert(orderTemplates).values([
      // Product subscription templates
      {
        paymentType: 'subscription',
        serviceType: 'product',
        templateName: 'ベーシックプラン',
        amount: '30000.00',
        description: 'プロダクト月額プラン - ベーシック（基本機能のみ）',
      },
      {
        paymentType: 'subscription',
        serviceType: 'product',
        templateName: 'スタンダードプラン',
        amount: '50000.00',
        description: 'プロダクト月額プラン - スタンダード（標準機能）',
      },
      {
        paymentType: 'subscription',
        serviceType: 'product',
        templateName: 'プロフェッショナルプラン',
        amount: '80000.00',
        description: 'プロダクト月額プラン - プロフェッショナル（高機能）',
      },
      {
        paymentType: 'subscription',
        serviceType: 'product',
        templateName: 'エンタープライズプラン',
        amount: '100000.00',
        description: 'プロダクト月額プラン - エンタープライズ（全機能）',
      },

      // Product onetime templates
      {
        paymentType: 'onetime',
        serviceType: 'product',
        templateName: '導入サポート',
        amount: '200000.00',
        description: 'プロダクト導入時の初期設定・サポート',
      },
      {
        paymentType: 'onetime',
        serviceType: 'product',
        templateName: 'カスタマイズ開発',
        amount: '500000.00',
        description: 'プロダクトの特別カスタマイズ開発',
      },

      // Project templates
      {
        paymentType: 'onetime',
        serviceType: 'project',
        templateName: 'ウェブサイト制作',
        amount: '300000.00',
        description: 'コーポレートサイト・LP制作',
      },
      {
        paymentType: 'onetime',
        serviceType: 'project',
        templateName: 'システム開発（小規模）',
        amount: '500000.00',
        description: '小規模なシステム開発・改修',
      },
      {
        paymentType: 'onetime',
        serviceType: 'project',
        templateName: 'システム開発（中規模）',
        amount: '800000.00',
        description: '中規模なシステム開発・新機能追加',
      },
      {
        paymentType: 'onetime',
        serviceType: 'project',
        templateName: 'システム開発（大規模）',
        amount: '1200000.00',
        description: '大規模なシステム開発・プラットフォーム構築',
      },
      {
        paymentType: 'onetime',
        serviceType: 'project',
        templateName: 'コンサルティング',
        amount: '600000.00',
        description: 'IT戦略・システム設計コンサルティング',
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log(`🏢 Created ${5} customers`);
    console.log(`💼 Created ${10} orders`);
    console.log(`📋 Created ${11} order templates`);
    console.log('');
    console.log('📊 Sales Summary:');
    console.log('- Product subscriptions: 5件');
    console.log('- Project orders: 5件');
    console.log('- Total revenue: ¥4,410,000');
    console.log('');
    console.log('📋 Template Summary:');
    console.log('- Product subscription templates: 4件');
    console.log('- Product onetime templates: 2件');
    console.log('- Project templates: 5件');

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