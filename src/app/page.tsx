'use client';

import { useState, useEffect } from 'react';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { CustomerList } from '@/components/dashboard/CustomerList';
import { PageHeader } from '@/components/layout/PageHeader';
import { useClientI18n } from '@/hooks/useClientI18n';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { MonthlySalesChart } from '@/components/dashboard/MonthlySalesChart';
import { MetricsCards } from '@/components/dashboard/MetricsCards';

export default function HomePage() {
  const { t, isClient } = useClientI18n();
  
  // ページタイトル設定
  useEffect(() => {
    if (isClient) {
      document.title = t('dashboardTitle');
    }
  }, [t, isClient]);
  const [period, setPeriod] = useState({
    startDate: '',
    endDate: ''
  });

  const handlePeriodChange = (newPeriod: { startDate: string; endDate: string }) => {
    setPeriod(newPeriod);
  };

  // Static data for display (since this is now a client component)
  const recentOrders = [
    {
      orderId: '1001',
      customerName: 'サンプル顧客A',
      amount: '500000',
      currency: 'JPY',
      paymentType: 'bank_transfer',
      serviceType: 'project',
      isPaid: true,
      salesStartDt: new Date('2024-01-15'),
      description: 'プロジェクト開発'
    },
    {
      orderId: '1002',
      customerName: 'サンプル顧客B',
      amount: '300000',
      currency: 'JPY',
      paymentType: 'credit_card',
      serviceType: 'product',
      isPaid: false,
      salesStartDt: new Date('2024-01-10'),
      description: 'Squadbaseサービス'
    }
  ];

  const customerStats = [
    {
      customerId: '1',
      customerName: 'サンプル顧客A',
      orderCount: 5,
      totalRevenue: 2500000,
      createdAt: new Date('2024-01-01')
    },
    {
      customerId: '2',
      customerName: 'サンプル顧客B',
      orderCount: 3,
      totalRevenue: 1500000,
      createdAt: new Date('2024-01-02')
    }
  ];
  const headerActions = null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <PageHeader
        title={t('dashboard')}
        description={t('welcome')}
        actions={headerActions}
      />

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {/* Metrics Cards */}
        <MetricsCards period={period} />

        {/* Period Selector */}
        <PeriodSelector onPeriodChange={handlePeriodChange} />

        {/* Monthly Sales Chart */}
        <div style={{ marginBottom: '20px' }}>
          <MonthlySalesChart period={period} />
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '16px'
        }}>
          <RecentOrders orders={recentOrders} />

          <CustomerList customers={customerStats} />
        </div>
      </div>
    </div>
  );
}