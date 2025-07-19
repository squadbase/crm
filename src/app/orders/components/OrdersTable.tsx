'use client';

import { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { StatusBadge, ServiceTypeBadge, PaymentTypeBadge } from './StatusBadge';
import { useClientI18n } from '@/hooks/useClientI18n';

interface Order {
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

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onPaymentStatusToggle: (orderId: string, isPaid: boolean) => void;
  onView?: (orderId: string) => void;
}

export function OrdersTable({ 
  orders, 
  loading, 
  onEdit, 
  onDelete, 
  onPaymentStatusToggle,
  onView
}: OrdersTableProps) {
  const { t, formatCurrency, formatDate } = useClientI18n();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return formatCurrency(num);
  };

  const formatDateRange = (startDt: string, endDt: string | null) => {
    const start = formatDate(startDt);
    if (!endDt) return `${start} ~ ${t('ongoing')}`;
    const end = formatDate(endDt);
    return start === end ? start : `${start} ~ ${end}`;
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedOrders(checked ? orders.map(order => order.orderId) : []);
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    setSelectedOrders(prev => 
      checked 
        ? [...prev, orderId]
        : prev.filter(id => id !== orderId)
    );
  };

  const handleBulkPaymentStatusUpdate = async (isPaid: boolean) => {
    for (const orderId of selectedOrders) {
      await onPaymentStatusToggle(orderId, isPaid);
    }
    setSelectedOrders([]);
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280', margin: 0 }}>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '60px 20px',
        textAlign: 'center',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
          注文データがありません
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      {/* 一括操作バー */}
      {selectedOrders.length > 0 && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>
            {selectedOrders.length}件選択中
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleBulkPaymentStatusUpdate(true)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              支払済にする
            </button>
            <button
              onClick={() => handleBulkPaymentStatusUpdate(false)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              未払にする
            </button>
          </div>
        </div>
      )}

      {/* テーブル */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                width: '40px'
              }}>
                <input
                  type="checkbox"
                  checked={selectedOrders.length === orders.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
{t('customerName')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
{t('service')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
{t('paymentType')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
{t('period')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
{t('amount')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
{t('paymentStatus')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                width: '100px'
              }}>
{t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId} style={{
                borderBottom: '1px solid #f3f4f6'
              }}>
                <td style={{ padding: '12px 16px' }}>
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.orderId)}
                    onChange={(e) => handleSelectOrder(order.orderId, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#0f172a',
                    marginBottom: '2px'
                  }}>
                    {order.customerName}
                  </div>
                  {order.description && (
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {order.description}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <ServiceTypeBadge serviceType={order.serviceType} size="sm" />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <PaymentTypeBadge paymentType={order.paymentType} size="sm" />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#374151'
                  }}>
                    {formatDateRange(order.salesStartDt, order.salesEndDt)}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0f172a'
                  }}>
                    {formatAmount(order.amount)}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => onPaymentStatusToggle(order.orderId, !order.isPaid)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <StatusBadge status={order.isPaid ? 'paid' : 'unpaid'} size="sm" />
                  </button>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    {onView && (
                      <button
                        onClick={() => onView(order.orderId)}
                        style={{
                          padding: '6px',
                          backgroundColor: 'transparent',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title={t('details')}
                      >
                        <Eye size={14} color="#2563eb" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(order)}
                      style={{
                        padding: '6px',
                        backgroundColor: 'transparent',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="編集"
                    >
                      <Edit size={14} color="#6b7280" />
                    </button>
                    <button
                      onClick={() => onDelete(order)}
                      style={{
                        padding: '6px',
                        backgroundColor: 'transparent',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="削除"
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}