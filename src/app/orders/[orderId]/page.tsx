'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, CreditCard, DollarSign, User, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { OrderForm } from '../components/OrderForm';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { useClientI18n } from '@/hooks/useClientI18n';

interface OrderDetail {
  orderId: string;
  customerId: string;
  customerName: string;
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

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter();
  const { t, formatCurrency } = useClientI18n();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError(t('orderNotFound'));
        } else {
          setError(t('dataFetchFailed'));
        }
        return;
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
      setError(t('dataFetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [orderId, t]);

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.orderId);
    };
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId, fetchOrderDetail]);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderId) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 削除成功後、注文一覧に戻る
        router.push('/orders');
      } else {
        console.error('Failed to delete order');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleFormSuccess = () => {
    // フォーム送信成功後、データを再取得
    fetchOrderDetail();
  };

  const getPaymentTypeLabel = (paymentType: string) => {
    return paymentType === 'onetime' ? t('oneTime') : t('subscription');
  };

  const getServiceTypeLabel = (serviceType: string) => {
    return serviceType === 'product' ? t('product') : t('projectType');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <p style={{ color: '#6b7280' }}>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        gap: '16px'
      }}>
        <p style={{ color: '#dc2626', fontSize: '16px' }}>{error}</p>
        <button
          onClick={() => router.back()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {t('back')}
        </button>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const headerActions = (
    <>
      <button
        onClick={() => router.back()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
        }}
      >
        <ArrowLeft size={16} />
        {t('back')}
      </button>
      <button
        onClick={handleEdit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
        }}
      >
        <Edit size={16} />
        {t('edit')}
      </button>
      <button
        onClick={handleDelete}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#dc2626',
          backgroundColor: 'white',
          border: '1px solid #dc2626',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#fef2f2';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
        }}
      >
        <Trash2 size={16} />
        {t('delete')}
      </button>
    </>
  );

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader
        title={`${t('orderDetails')}`}
        description={`${t('orderId')}: ${orderId || ''}`}
        actions={headerActions}
      />

      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        {/* 基本情報 */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '16px'
          }}>
            {t('basicInformation')}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {/* 顧客情報 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px'
            }}>
              <User size={20} color="#2563eb" />
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 4px 0'
                }}>
                  {t('customer')}
                </p>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0f172a',
                  margin: 0,
                  cursor: 'pointer'
                }}
                  onClick={() => router.push(`/customers/${order.customerId}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#2563eb';
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#0f172a';
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  {order.customerName}
                </p>
              </div>
            </div>

            {/* 金額 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px'
            }}>
              <DollarSign size={20} color="#0284c7" />
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 4px 0'
                }}>
                  {t('amount')}
                </p>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: 0
                }}>
                  {formatCurrency(Number(order.amount))}
                </p>
              </div>
            </div>

            {/* 支払い状況 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: order.isPaid ? '#f0fdf4' : '#fef2f2',
              borderRadius: '8px'
            }}>
              <CreditCard size={20} color={order.isPaid ? '#16a34a' : '#dc2626'} />
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 4px 0'
                }}>
                  {t('paymentStatus')}
                </p>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: order.isPaid ? '#16a34a' : '#dc2626',
                  margin: 0
                }}>
                  {order.isPaid ? t('paid') : t('unpaid')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* サービス詳細 */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '16px'
          }}>
            {t('serviceDetails')}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t('paymentType')}
              </p>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#0f172a',
                margin: 0
              }}>
                {getPaymentTypeLabel(order.paymentType)}
              </p>
            </div>

            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t('serviceType')}
              </p>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#0f172a',
                margin: 0
              }}>
                {getServiceTypeLabel(order.serviceType)}
              </p>
            </div>

            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t('contractStartDate')}
              </p>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#0f172a',
                margin: 0
              }}>
                {formatDate(order.salesStartDt)}
              </p>
            </div>

            {order.salesEndDt && (
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 4px 0'
                }}>
                  {t('contractEndDate')}
                </p>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0f172a',
                  margin: 0
                }}>
                  {formatDate(order.salesEndDt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 説明 */}
        {order.description && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '16px'
            }}>
              {t('description')}
            </h3>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#374151',
                margin: 0,
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {order.description}
              </p>
            </div>
          </div>
        )}

        {/* 履歴情報 */}
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '16px'
          }}>
            {t('history')}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px'
            }}>
              <Clock size={16} color="#6b7280" />
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 2px 0'
                }}>
                  {t('created')}
                </p>
                <p style={{
                  fontSize: '13px',
                  color: '#374151',
                  margin: 0
                }}>
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px'
            }}>
              <Clock size={16} color="#6b7280" />
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 2px 0'
                }}>
                  {t('lastUpdated')}
                </p>
                <p style={{
                  fontSize: '13px',
                  color: '#374151',
                  margin: 0
                }}>
                  {formatDateTime(order.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* モーダル */}
      <OrderForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={handleFormSuccess}
        editingOrder={order}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        orderName={order ? `${order.customerName} - ${order.description || order.serviceType}` : ''}
      />
    </div>
  );
}