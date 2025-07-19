'use client';

import { ArrowUpRight, Calendar, CreditCard } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';
import { useState, useEffect } from 'react';

interface Order {
  orderId: string;
  customerName: string | null;
  amount: string;
  paymentType: string;
  serviceType: string;
  isPaid: boolean;
  salesStartDt: Date | null;
  description: string | null;
}

export function RecentOrders({ orders: recentOrders }: { orders: Order[] }) {
  const { t, formatCurrency, formatDate, isClient } = useClientI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ 
      backgroundColor: 'white', 
      border: '1px solid #e2e8f0', 
      borderRadius: '8px', 
      padding: '16px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '12px' 
      }}>
        <h3 style={{ 
          fontSize: '15px', 
          fontWeight: '600', 
          color: '#0f172a' 
        }}>{t('recentOrders')}</h3>
        <button 
          onClick={() => window.location.href = '/orders'}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '6px 10px', 
            fontSize: '13px', 
            fontWeight: '500',
            color: '#374151',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
{t('viewAll')}
          <ArrowUpRight style={{ height: '14px', width: '14px', marginLeft: '4px' }} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {recentOrders.map((order) => (
          <div
            key={order.orderId}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              transition: 'background-color 0.2s',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{ flex: '1', minWidth: '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <p style={{ 
                  fontWeight: '500', 
                  fontSize: '13px', 
                  color: '#0f172a',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {order.customerName}
                </p>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: order.isPaid ? '#16a34a' : '#ef4444',
                  color: 'white'
                }}>
{order.isPaid ? t('paid') : t('unpaid')}
                </span>
              </div>
              <p style={{ 
                fontSize: '11px', 
                color: '#6b7280', 
                marginTop: '3px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {order.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CreditCard style={{ height: '11px', width: '11px', color: '#6b7280' }} />
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>
{order.paymentType === 'subscription' ? t('subscription') : t('oneTime')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar style={{ height: '11px', width: '11px', color: '#6b7280' }} />
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>
{order.salesStartDt ? (mounted ? formatDate(order.salesStartDt) : new Date(order.salesStartDt).toLocaleDateString('ja-JP')) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: '#0f172a' 
              }}>
                {formatCurrency(Number(order.amount))}
              </p>
              <span style={{
                fontSize: '11px',
                fontWeight: '500',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: order.serviceType === 'product' ? '#2563eb' : '#64748b',
                color: 'white',
                marginTop: '4px',
                display: 'inline-block'
              }}>
{order.serviceType === 'product' ? t('productService') : t('projectService')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}