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
  const { t } = useClientI18n();

  // Page title setup
  useEffect(() => {
    document.title = t('dashboardTitle');
  }, [t]);
  const [period, setPeriod] = useState({
    startDate: '',
    endDate: ''
  });

  const handlePeriodChange = (newPeriod: { startDate: string; endDate: string }) => {
    setPeriod(newPeriod);
  };

  // Dynamic data state
  const [recentOrders, setRecentOrders] = useState([]);
  const [customerStats, setCustomerStats] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Fetch recent orders
  const fetchRecentOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch('/api/orders?limit=5&sort=created&direction=desc');
      const data = await response.json();

      if (data.orders && data.orders.length > 0) {
        const formattedOrders = data.orders.map((order: {
          orderId: string;
          customerName: string;
          amount: string;
          paymentType: string;
          serviceType: string;
          isPaid: boolean;
          salesStartDt: string;
          salesEndDt?: string | null;
          description?: string | null;
        }) => ({
          orderId: order.orderId,
          customerName: order.customerName,
          amount: order.amount,
          paymentType: order.paymentType,
          serviceType: order.serviceType,
          isPaid: order.isPaid,
          salesStartDt: new Date(order.salesStartDt),
          description: order.description
        }));
        setRecentOrders(formattedOrders);
      } else {
        setRecentOrders([]);
      }
    } catch {
      setRecentOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch top customers
  const fetchTopCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await fetch('/api/customers?limit=5&sort=revenue&direction=desc');
      const data = await response.json();

      if (data.customers && data.customers.length > 0) {
        const formattedCustomers = data.customers.map((customer: {
          customerId: string;
          customerName: string;
          orderCount: number;
          totalRevenue: number;
          createdAt: string;
        }) => ({
          customerId: customer.customerId,
          customerName: customer.customerName,
          orderCount: customer.orderCount || 0,
          totalRevenue: customer.totalRevenue || 0,
          createdAt: new Date(customer.createdAt)
        }));
        setCustomerStats(formattedCustomers);
      } else {
        setCustomerStats([]);
      }
    } catch {
      setCustomerStats([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchRecentOrders();
    fetchTopCustomers();
  }, []);
  const headerActions = null;

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title={t('dashboard')}
        description={t('welcome')}
        actions={headerActions}
      />

      {/* Content */}
      <div className="p-4">
        {/* Metrics Cards */}
        <MetricsCards period={period} />

        {/* Period Selector */}
        <PeriodSelector onPeriodChange={handlePeriodChange} />

        {/* Monthly Sales Chart */}
        <div className="mb-5">
          <MonthlySalesChart period={period} />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4">
          <RecentOrders orders={recentOrders} loading={loadingOrders} />

          <CustomerList customers={customerStats} loading={loadingCustomers} />
        </div>
      </div>
    </div>
  );
}