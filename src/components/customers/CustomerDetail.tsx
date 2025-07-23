'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building, Calendar, ShoppingBag, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useClientI18n } from '@/hooks/useClientI18n';

interface Customer {
  customerId: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  orderId: string;
  customerId: string;
  amount: string;
  salesAt: string;
  isPaid: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Subscription {
  subscriptionId: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  year: number | null;
  month: number | null;
  amount: string | null;
  isPaid: boolean | null;
  paidCreatedAt: string | null;
}

interface CustomerStats {
  totalOrders: number;
  totalSubscriptions: number;
  onetimeRevenue: number;
  subscriptionRevenue: number;
  totalRevenue: number;
  unpaidOrders: number;
  paidOrders: number;
}

interface CustomerDetailData {
  customer: Customer;
  orders: Order[];
  subscriptions: Subscription[];
  stats: CustomerStats;
}

interface CustomerDetailProps {
  customerId: string;
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const { t, formatCurrency, formatDate, getLanguage } = useClientI18n();
  const router = useRouter();
  const [data, setData] = useState<CustomerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'subscriptions'>('orders');

  useEffect(() => {
    fetchCustomerDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  // Set page title
  useEffect(() => {
    if (data?.customer?.customerName) {
      document.title = `${data.customer.customerName} - ${t('customerDetail')}`;
    } else {
      document.title = t('customerDetail');
    }
  }, [data?.customer?.customerName, t]);

  const fetchCustomerDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError(t('customerNotFound'));
        } else {
          throw new Error('Failed to fetch customer details');
        }
        return;
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : t('dataFetchFailed'));
    } finally {
      setLoading(false);
    }
  };



  const headerActions = (
    <button 
      onClick={() => router.back()}
      className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
    >
      <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
      {t('back')}
    </button>
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <PageHeader
          title={t('customerDetail')}
          description={t('customerDetailDescription')}
          actions={headerActions}
        />
        <div className="flex-1 p-4 bg-white">
          <div className="flex items-center justify-center p-8 bg-white border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data || !data.customer) {
    return (
      <div className="flex flex-col min-h-screen">
        <PageHeader
          title={t('customerDetail')}
          description={t('customerDetailDescription')}
          actions={headerActions}
        />
        <div className="flex-1 p-4 bg-white">
          <div className="p-8 bg-red-50 border border-red-300 rounded-lg text-center">
            <p className="text-sm text-red-600 m-0">
{error || t('dataFetchFailed')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={data.customer.customerName}
        description={t('customerDetailDescription')}
        actions={headerActions}
      />
      
      <div className="flex-1 p-4 bg-slate-50">
        {/* Customer Info Card */}
        <div className="bg-white border border-slate-300 rounded-lg p-5 mb-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 m-0">
                {data.customer.customerName}
              </h2>
              <p className="text-xs text-gray-500 m-0">
                ID: {data.customer.customerId}
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{t('registrationDate')}: {data.customer.createdAt ? formatDate(data.customer.createdAt) : '-'}</span>
            </div>
            {data.customer.updatedAt && data.customer.updatedAt !== data.customer.createdAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{t('updateDate')}: {formatDate(data.customer.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 m-0">{t('onetimeRevenue')}</p>
                <p className="text-sm font-semibold text-slate-900 m-0">
                  {formatCurrency(data.stats.onetimeRevenue)}
                </p>
              </div>
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-indigo-700" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 m-0">{t('subscriptionRevenue')}</p>
                <p className="text-sm font-semibold text-slate-900 m-0">
                  {formatCurrency(data.stats.subscriptionRevenue)}
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 m-0">{t('totalRevenue')}</p>
                <p className="text-sm font-semibold text-slate-900 m-0">
                  {formatCurrency(data.stats.totalRevenue)}
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 m-0">{t('ordersCount')} ({data.stats.totalOrders})</p>
                <p className="text-sm font-semibold text-slate-900 m-0">
                  {data.stats.paidOrders} {t('paidStatus')}
                </p>
              </div>
              <div className="h-10 w-10 bg-orange-200 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>

        </div>

        {/* Tabbed Content */}
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-300">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 p-4 border-none cursor-pointer text-sm font-medium ${
                activeTab === 'orders' 
                  ? 'bg-slate-50 text-blue-600 border-b-2 border-blue-600' 
                  : 'bg-transparent text-gray-500 border-b-2 border-transparent'
              }`}
            >
              {t('onetimeOrders')} ({data.orders?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex-1 p-4 border-none cursor-pointer text-sm font-medium ${
                activeTab === 'subscriptions' 
                  ? 'bg-slate-50 text-blue-600 border-b-2 border-blue-600' 
                  : 'bg-transparent text-gray-500 border-b-2 border-transparent'
              }`}
            >
              {t('subscriptions')} ({data.stats?.totalSubscriptions || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'orders' ? (
              // Orders Tab
              !data.orders || data.orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="m-0">{t('noOnetimeOrders')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300">
                        <th className="text-left py-2 px-1.5 text-xs font-medium text-gray-500">
                          {t('orderIdLabel')}
                        </th>
                        <th className="text-center py-2 px-1.5 text-xs font-medium text-gray-500">
                          {t('amount')}
                        </th>
                        <th className="text-center py-2 px-1.5 text-xs font-medium text-gray-500">
                          {t('paymentStatus')}
                        </th>
                        <th className="text-center py-2 px-1.5 text-xs font-medium text-gray-500">
                          {t('salesDate')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.orders || []).map((order) => (
                        <tr key={order.orderId} className="border-b border-slate-100">
                          <td className="py-3 px-1.5">
                            <div>
                              <p 
                                className="text-xs font-medium text-blue-600 m-0 cursor-pointer underline"
                                onClick={() => router.push(`/orders/${order.orderId}`)}
                              >
                                {order.orderId.slice(0, 8)}...
                              </p>
                              {order.description && (
                                <p className="text-[11px] text-gray-500 m-0">
                                  {order.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-1.5 text-center">
                            <span className="text-xs font-medium">
                              {formatCurrency(Number(order.amount))}
                            </span>
                          </td>
                          <td className="py-3 px-1.5 text-center">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              order.isPaid 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-500'
                            }`}>
                              {order.isPaid ? t('paid') : t('unpaid')}
                            </span>
                          </td>
                          <td className="py-3 px-1.5 text-center">
                            <span className="text-xs text-gray-500">
                              {order.salesAt ? formatDate(order.salesAt) : '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              // Subscriptions Tab
              !data.subscriptions || data.subscriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="m-0">{t('noSubscriptions')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300">
                        <th className="text-left py-2 px-1.5 text-xs font-medium text-gray-500">
                          {t('subscriptionIdLabel')}
                        </th>
                        <th className="text-center py-2 px-1.5 text-xs font-medium text-gray-500">
                          {t('yearMonth')}
                        </th>
                        <th className="text-center py-2 px-1.5 text-xs font-medium text-gray-500">
                          {t('amount')}
                        </th>
                        <th className="text-center py-2 px-1.5 text-xs font-medium text-gray-500">
                          {t('paymentStatus')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.subscriptions || []).filter(sub => sub && sub.year && sub.month && sub.amount).map((subscription, index) => (
                        <tr key={`${subscription.subscriptionId}-${subscription.year}-${subscription.month}-${subscription.paidCreatedAt || 'na'}-${index}`} className="border-b border-slate-100">
                          <td className="py-3 px-1.5">
                            <div>
                              <p 
                                className="text-xs font-medium text-purple-600 m-0 cursor-pointer underline"
                                onClick={() => router.push(`/subscriptions/${subscription.subscriptionId}`)}
                              >
                                {subscription.subscriptionId.slice(0, 8)}...
                              </p>
                              {subscription.description && (
                                <p className="text-[11px] text-gray-500 m-0">
                                  {subscription.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-1.5 text-center">
                            <span className="text-xs">
                              {getLanguage() === 'ja' ? `${subscription.year}年${subscription.month}月` : `${subscription.year}/${subscription.month}`}
                            </span>
                          </td>
                          <td className="py-3 px-1.5 text-center">
                            <span className="text-xs font-medium">
                              {formatCurrency(Number(subscription.amount || 0))}
                            </span>
                          </td>
                          <td className="py-3 px-1.5 text-center">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              subscription.isPaid === null 
                                ? 'bg-gray-100 text-gray-500' 
                                : subscription.isPaid 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-red-100 text-red-500'
                            }`}>
                              {subscription.isPaid === null ? '-' : (subscription.isPaid ? t('paid') : t('unpaid'))}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}