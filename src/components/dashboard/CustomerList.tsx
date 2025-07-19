'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, Building, Calendar, ShoppingBag } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface Customer {
  customerId: string;
  customerName: string;
  orderCount: number;
  totalRevenue: number | null;
  createdAt: Date;
}

export function CustomerList({ customers: customerStats, loading }: { customers: Customer[]; loading: boolean }) {
  const { t, formatCurrency, formatDate } = useClientI18n();
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
        }}>{t('topCustomers')}</h3>
        <button 
          onClick={() => window.location.href = '/customers'}
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
{t('allCustomers')}
          <ArrowUpRight style={{ height: '14px', width: '14px', marginLeft: '4px' }} />
        </button>
      </div>
      
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '40px 0' 
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : customerStats.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          color: '#6b7280' 
        }}>
          <p style={{ fontSize: '14px', margin: '0' }}>
            {t('noData')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {customerStats.map((customer) => (
          <div
            key={customer.customerId}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '28px', 
                height: '28px', 
                backgroundColor: '#dbeafe', 
                borderRadius: '50%' 
              }}>
                <Building style={{ height: '14px', width: '14px', color: '#2563eb' }} />
              </div>
              <div style={{ flex: '1', minWidth: '0' }}>
                <span style={{ 
                  fontWeight: '500', 
                  fontSize: '13px', 
                  color: '#0f172a',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {customer.customerName}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShoppingBag style={{ height: '11px', width: '11px', color: '#6b7280' }} />
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      {customer.orderCount}{t('orders_unit')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar style={{ height: '11px', width: '11px', color: '#6b7280' }} />
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      {mounted ? formatDate(customer.createdAt) : new Date(customer.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: '#0f172a' 
              }}>
                {formatCurrency(customer.totalRevenue || 0)}
              </p>
              <p style={{ 
                fontSize: '11px', 
                color: '#6b7280' 
              }}>
                {t('revenue')}
              </p>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}