'use client';

import { Eye, Plus } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface Subscription {
  subscriptionId: string;
  customerId: string;
  customerName: string;
  description: string;
  currentAmount: number;
  startDate: string | null;
  endDate: string | null;
  totalPaid: number;
  totalUnpaid: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  loading: boolean;
  onView: (subscriptionId: string) => void;
  onCreateNew: () => void;
}

export function SubscriptionsTable({
  subscriptions,
  loading,
  onView,
  onCreateNew
}: SubscriptionsTableProps) {
  const { t, formatCurrency, formatDate } = useClientI18n();

  const formatAmount = (amount: number) => {
    return formatCurrency(amount);
  };

  const formatDateLocal = (dateString: string) => {
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '16px',
          color: '#6b7280'
        }}>
          {t('loadingSubscriptions')}
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          fontSize: '15px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '8px'
        }}>
          {t('noSubscriptionsFound')}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '20px'
        }}>
          {t('noSubscriptionsDescription')}
        </div>
        <button
          onClick={onCreateNew}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'white',
            backgroundColor: '#2563eb',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          {t('createFirstSubscription')}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {t('customerNameHeader')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {t('serviceContent')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'right',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {t('monthlyFee')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'right',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {t('totalPaid')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'right',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {t('totalUnpaid')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {t('paymentStartDate')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {t('paymentEndDate')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr
                key={subscription.subscriptionId}
                style={{
                  borderBottom: '1px solid #e5e7eb'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <td style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#111827'
                }}>
                  {subscription.customerName}
                </td>
                <td style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {subscription.description || '-'}
                </td>
                <td style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#111827'
                }}>
                  {formatAmount(subscription.currentAmount)}
                </td>
                <td style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontSize: '14px',
                  color: '#059669'
                }}>
                  {formatAmount(subscription.totalPaid)}
                </td>
                <td style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontSize: '14px',
                  color: '#dc2626'
                }}>
                  {formatAmount(subscription.totalUnpaid)}
                </td>
                <td style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#6b7280'
                }}>
                  {subscription.startDate ? formatDateLocal(subscription.startDate) : '-'}
                </td>
                <td style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#6b7280'
                }}>
                  {subscription.endDate ? formatDateLocal(subscription.endDate) : t('continuing')}
                </td>
                <td style={{
                  padding: '12px 16px',
                  textAlign: 'center'
                }}>
                  <button
                    onClick={() => onView(subscription.subscriptionId)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: '#374151',
                      backgroundColor: 'transparent',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Eye size={12} />
                    {t('viewDetails')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}