'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building, Calendar, ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';
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
  paymentType: 'onetime' | 'subscription';
  serviceType: 'product' | 'project';
  salesStartDt: string;
  salesEndDt: string | null;
  amount: string;
  isPaid: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CustomerStats {
  totalOrders: number;
  totalRevenue: number;
  unpaidOrders: number;
  paidOrders: number;
}

interface CustomerDetailData {
  customer: Customer;
  orders: Order[];
  stats: CustomerStats;
}

interface CustomerDetailProps {
  customerId: string;
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const { t, formatCurrency, formatDate } = useClientI18n();
  const router = useRouter();
  const [data, setData] = useState<CustomerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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


  const getPaymentTypeLabel = (paymentType: string) => {
    return paymentType === 'onetime' ? t('oneTime') : t('subscription');
  };

  const getServiceTypeLabel = (serviceType: string) => {
    return serviceType === 'product' ? t('product') : t('projectType');
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

  if (error || !data) {
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
              <span>{t('registrationDate')}: {formatDate(data.customer.createdAt)}</span>
            </div>
            {data.customer.updatedAt !== data.customer.createdAt && (
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', margin: 0 }}>{t('totalOrdersCount')}</p>
                <p style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                  {data.stats.totalOrders}{t('ordersUnit')}
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

          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', margin: 0 }}>{t('revenue')}</p>
                <p style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
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
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', margin: 0 }}>{t('paidCount')}</p>
                <p style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                  {data.stats.paidOrders}{t('ordersUnit')}
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
                <CheckCircle style={{ height: '20px', width: '20px', color: '#16a34a' }} />
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
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', margin: 0 }}>{t('unpaidCount')}</p>
                <p style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                  {data.stats.unpaidOrders}{t('ordersUnit')}
                </p>
              </div>
              <div style={{
                height: '40px',
                width: '40px',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <XCircle style={{ height: '20px', width: '20px', color: '#ef4444' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
              {t('orderHistory')} ({data.orders.length}{t('ordersUnit')})
            </h3>
          </div>
          <div style={{ padding: '16px' }}>
            {data.orders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '32px',
                color: '#6b7280'
              }}>
                <p style={{ margin: 0 }}>{t('noOrderHistory')}</p>
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
                      }}>{t('orderId')}</th>
                      <th style={{
                        textAlign: 'left',
                        padding: '8px 6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#6b7280'
                      }}>{t('service')}</th>
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
                      }}>{t('payment')}</th>
                      <th style={{
                        textAlign: 'center',
                        padding: '8px 6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#6b7280'
                      }}>{t('paymentType')}</th>
                      <th style={{
                        textAlign: 'center',
                        padding: '8px 6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#6b7280'
                      }}>{t('salesStartDate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((order) => (
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
                        <td style={{ padding: '12px 6px' }}>
                          <span style={{
                            fontSize: '12px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: order.serviceType === 'product' ? '#dbeafe' : '#f3e8ff',
                            color: order.serviceType === 'product' ? '#2563eb' : '#7c3aed'
                          }}>
                            {getServiceTypeLabel(order.serviceType)}
                          </span>
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
                          <span style={{ fontSize: '13px' }}>
                            {getPaymentTypeLabel(order.paymentType)}
                          </span>
                        </td>
                        <td style={{ padding: '12px 6px', textAlign: 'center' }}>
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}