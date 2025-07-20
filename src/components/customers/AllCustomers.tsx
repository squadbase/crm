'use client';

import { Building, Calendar, Edit, Trash2 } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface Customer {
  customerId: string;
  customerName: string;
  orderCount?: number;
  onetimeRevenue?: number | null;
  subscriptionRevenue?: number | null;
  totalRevenue?: number | null;
  lastOrderDate?: string | null;
  createdAt: Date;
  updatedAt?: Date;
}

interface AllCustomersProps {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
}

export function AllCustomers({ customers: customerStats, onEdit, onDelete }: AllCustomersProps) {
  const { t, formatCurrency, formatDate } = useClientI18n();

  return (
    <div style={{ 
      backgroundColor: 'white', 
      border: '1px solid #e2e8f0', 
      borderRadius: '8px', 
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
    }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{t('allCustomers')}</h3>
          <span style={{
            fontSize: '11px',
            fontWeight: '500',
            padding: '3px 6px',
            borderRadius: '4px',
            backgroundColor: '#f1f5f9',
            color: '#64748b'
          }}>
            {customerStats.length}{t('people')}
          </span>
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ 
                width: '300px', 
                textAlign: 'left', 
                padding: '8px 6px', 
                fontSize: '13px', 
                fontWeight: '500', 
                color: '#6b7280' 
              }}>{t('customerName')}</th>
              {typeof customerStats[0]?.onetimeRevenue !== 'undefined' && (
                <th style={{ 
                  textAlign: 'center', 
                  padding: '8px 6px', 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  color: '#6b7280' 
                }}>One-time収益</th>
              )}
              {typeof customerStats[0]?.subscriptionRevenue !== 'undefined' && (
                <th style={{ 
                  textAlign: 'center', 
                  padding: '8px 6px', 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  color: '#6b7280' 
                }}>サブスク収益</th>
              )}
              {typeof customerStats[0]?.totalRevenue !== 'undefined' && (
                <th style={{ 
                  textAlign: 'center', 
                  padding: '8px 6px', 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  color: '#6b7280' 
                }}>総収益</th>
              )}
              {typeof customerStats[0]?.lastOrderDate !== 'undefined' && (
                <th style={{ 
                  textAlign: 'center', 
                  padding: '8px 6px', 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  color: '#6b7280' 
                }}>{t('lastOrder')}</th>
              )}
              <th style={{ 
                textAlign: 'center', 
                padding: '8px 6px', 
                fontSize: '13px', 
                fontWeight: '500', 
                color: '#6b7280' 
              }}>{t('created')}</th>
              <th style={{ 
                textAlign: 'right', 
                padding: '8px 6px', 
                fontSize: '13px', 
                fontWeight: '500', 
                color: '#6b7280' 
              }}>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {customerStats.map((customer) => (
              <tr key={customer.customerId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px 6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '32px', 
                      height: '32px', 
                      backgroundColor: '#dbeafe', 
                      borderRadius: '50%' 
                    }}>
                      <Building style={{ height: '16px', width: '16px', color: '#2563eb' }} />
                    </div>
                    <div>
                      <button
                        onClick={() => window.location.href = `/customers/${customer.customerId}`}
                        style={{ 
                          fontWeight: '500', 
                          color: '#2563eb',
                          fontSize: '13px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#1d4ed8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#2563eb';
                        }}
                      >
                        {customer.customerName}
                      </button>
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                        ID: {customer.customerId.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </td>
                {typeof customer.onetimeRevenue !== 'undefined' && (
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <span style={{ fontWeight: '500' }}>
                      {formatCurrency(customer.onetimeRevenue || 0)}
                    </span>
                  </td>
                )}
                {typeof customer.subscriptionRevenue !== 'undefined' && (
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <span style={{ fontWeight: '500' }}>
                      {formatCurrency(customer.subscriptionRevenue || 0)}
                    </span>
                  </td>
                )}
                {typeof customer.totalRevenue !== 'undefined' && (
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <span style={{ fontWeight: '500' }}>
                      {formatCurrency(customer.totalRevenue || 0)}
                    </span>
                  </td>
                )}
                {typeof customer.lastOrderDate !== 'undefined' && (
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Calendar style={{ height: '14px', width: '14px', color: '#6b7280' }} />
                      <span style={{ fontSize: '13px' }}>
                        {customer.lastOrderDate
                          ? formatDate(customer.lastOrderDate)
                          : '-'}
                      </span>
                    </div>
                  </td>
                )}
                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    {formatDate(customer.createdAt)}
                  </span>
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(customer)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Edit style={{ height: '14px', width: '14px', color: '#6b7280' }} />
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(customer)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 style={{ height: '14px', width: '14px', color: '#dc2626' }} />
                      </button>
                    )}
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