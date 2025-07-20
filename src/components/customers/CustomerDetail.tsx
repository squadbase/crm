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

  // ページタイトル設定
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
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '6px 12px', 
        fontSize: '13px', 
        fontWeight: '500',
        color: '#374151',
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        cursor: 'pointer'
      }}
    >
      <ArrowLeft style={{ height: '14px', width: '14px', marginRight: '6px' }} />
      {t('back')}
    </button>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <PageHeader
          title={t('customerDetail')}
          description={t('customerDetailDescription')}
          actions={headerActions}
        />
        <div style={{ flex: 1, padding: '16px', backgroundColor: 'white' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data || !data.customer) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <PageHeader
          title={t('customerDetail')}
          description={t('customerDetailDescription')}
          actions={headerActions}
        />
        <div style={{ flex: 1, padding: '16px', backgroundColor: 'white' }}>
          <div style={{
            padding: '32px',
            backgroundColor: '#fef2f2',
            border: '1px solid #f87171',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>
{error || t('dataFetchFailed')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PageHeader
        title={data.customer.customerName}
        description={t('customerDetailDescription')}
        actions={headerActions}
      />
      
      <div style={{ flex: 1, padding: '16px', backgroundColor: '#f8fafc' }}>
        {/* Customer Info Card */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              backgroundColor: '#dbeafe',
              borderRadius: '50%'
            }}>
              <Building style={{ height: '24px', width: '24px', color: '#2563eb' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                {data.customer.customerName}
              </h2>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                ID: {data.customer.customerId}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar style={{ height: '14px', width: '14px' }} />
              <span>{t('registrationDate')}: {data.customer.createdAt ? formatDate(data.customer.createdAt) : '-'}</span>
            </div>
            {data.customer.updatedAt && data.customer.updatedAt !== data.customer.createdAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock style={{ height: '14px', width: '14px' }} />
                <span>{t('updateDate')}: {formatDate(data.customer.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', margin: 0 }}>{t('onetimeRevenue')}</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                  {formatCurrency(data.stats.onetimeRevenue)}
                </p>
              </div>
              <div style={{
                height: '40px',
                width: '40px',
                backgroundColor: '#e0e7ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShoppingBag style={{ height: '20px', width: '20px', color: '#3730a3' }} />
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', margin: 0 }}>{t('subscriptionRevenue')}</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                  {formatCurrency(data.stats.subscriptionRevenue)}
                </p>
              </div>
              <div style={{
                height: '40px',
                width: '40px',
                backgroundColor: '#f3e8ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShoppingBag style={{ height: '20px', width: '20px', color: '#7c3aed' }} />
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', margin: 0 }}>{t('totalRevenue')}</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                  {formatCurrency(data.stats.totalRevenue)}
                </p>
              </div>
              <div style={{
                height: '40px',
                width: '40px',
                backgroundColor: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShoppingBag style={{ height: '20px', width: '20px', color: '#16a34a' }} />
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', margin: 0 }}>{t('ordersCount')} ({data.stats.totalOrders})</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                  {data.stats.paidOrders} {t('paidStatus')}
                </p>
              </div>
              <div style={{
                height: '40px',
                width: '40px',
                backgroundColor: '#fed7aa',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShoppingBag style={{ height: '20px', width: '20px', color: '#f97316' }} />
              </div>
            </div>
          </div>

        </div>

        {/* Tabbed Content */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: activeTab === 'orders' ? '#f8fafc' : 'transparent',
                borderBottom: activeTab === 'orders' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === 'orders' ? '#2563eb' : '#6b7280'
              }}
            >
              {t('onetimeOrders')} ({data.orders?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: activeTab === 'subscriptions' ? '#f8fafc' : 'transparent',
                borderBottom: activeTab === 'subscriptions' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === 'subscriptions' ? '#2563eb' : '#6b7280'
              }}
            >
              {t('subscriptions')} ({data.stats?.totalSubscriptions || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '16px' }}>
            {activeTab === 'orders' ? (
              // Orders Tab
              !data.orders || data.orders.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '32px',
                  color: '#6b7280'
                }}>
                  <p style={{ margin: 0 }}>{t('noOnetimeOrders')}</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{
                          textAlign: 'left',
                          padding: '8px 6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#6b7280'
                        }}>{t('orderIdLabel')}</th>
                        <th style={{
                          textAlign: 'center',
                          padding: '8px 6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#6b7280'
                        }}>{t('amount')}</th>
                        <th style={{
                          textAlign: 'center',
                          padding: '8px 6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#6b7280'
                        }}>{t('paymentStatus')}</th>
                        <th style={{
                          textAlign: 'center',
                          padding: '8px 6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#6b7280'
                        }}>{t('salesDate')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.orders || []).map((order) => (
                        <tr key={order.orderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 6px' }}>
                            <div>
                              <p style={{ 
                                fontSize: '13px', 
                                fontWeight: '500', 
                                color: '#2563eb', 
                                margin: 0, 
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                                onClick={() => router.push(`/orders/${order.orderId}`)}
                              >
                                {order.orderId.slice(0, 8)}...
                              </p>
                              {order.description && (
                                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                                  {order.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 6px', textAlign: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>
                              {formatCurrency(Number(order.amount))}
                            </span>
                          </td>
                          <td style={{ padding: '12px 6px', textAlign: 'center' }}>
                            <span style={{
                              fontSize: '12px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: order.isPaid ? '#dcfce7' : '#fee2e2',
                              color: order.isPaid ? '#16a34a' : '#ef4444'
                            }}>
                              {order.isPaid ? t('paid') : t('unpaid')}
                            </span>
                          </td>
                          <td style={{ padding: '12px 6px', textAlign: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#6b7280' }}>
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
                <div style={{
                  textAlign: 'center',
                  padding: '32px',
                  color: '#6b7280'
                }}>
                  <p style={{ margin: 0 }}>{t('noSubscriptions')}</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{
                          textAlign: 'left',
                          padding: '8px 6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#6b7280'
                        }}>{t('subscriptionIdLabel')}</th>
                        <th style={{
                          textAlign: 'center',
                          padding: '8px 6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#6b7280'
                        }}>{t('yearMonth')}</th>
                        <th style={{
                          textAlign: 'center',
                          padding: '8px 6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#6b7280'
                        }}>{t('amount')}</th>
                        <th style={{
                          textAlign: 'center',
                          padding: '8px 6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#6b7280'
                        }}>{t('paymentStatus')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.subscriptions || []).filter(sub => sub && sub.year && sub.month && sub.amount).map((subscription) => (
                        <tr key={`${subscription.subscriptionId}-${subscription.year}-${subscription.month}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 6px' }}>
                            <div>
                              <p style={{ 
                                fontSize: '13px', 
                                fontWeight: '500', 
                                color: '#7c3aed', 
                                margin: 0, 
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                                onClick={() => router.push(`/subscriptions/${subscription.subscriptionId}`)}
                              >
                                {subscription.subscriptionId.slice(0, 8)}...
                              </p>
                              {subscription.description && (
                                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                                  {subscription.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 6px', textAlign: 'center' }}>
                            <span style={{ fontSize: '13px' }}>
                              {getLanguage() === 'ja' ? `${subscription.year}年${subscription.month}月` : `${subscription.year}/${subscription.month}`}
                            </span>
                          </td>
                          <td style={{ padding: '12px 6px', textAlign: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>
                              {formatCurrency(Number(subscription.amount || 0))}
                            </span>
                          </td>
                          <td style={{ padding: '12px 6px', textAlign: 'center' }}>
                            <span style={{
                              fontSize: '12px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: subscription.isPaid ? '#dcfce7' : '#fee2e2',
                              color: subscription.isPaid ? '#16a34a' : '#ef4444'
                            }}>
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