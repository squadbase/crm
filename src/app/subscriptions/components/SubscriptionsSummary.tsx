'use client';

import { useEffect, useState } from 'react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface SummaryData {
  totalMonthlyRevenue: string;
  totalUnpaid: string;
  averageContinuationMonths: number;
}

export function SubscriptionsSummary() {
  const { t, formatCurrency } = useClientI18n();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/subscriptions/summary');
      const result = await response.json();
      setData(result);
    } catch {
      // Failed to fetch subscriptions summary data
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return formatCurrency(num);
  };

  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '20px',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const summaryCards = [
    {
      title: t('monthlyRevenueExpected'),
      value: formatAmount(data.totalMonthlyRevenue || 0),
      color: '#7c3aed'
    },
    {
      title: t('totalUnpaid'),
      value: formatAmount(data.totalUnpaid || 0),
      color: '#ef4444'
    },
    {
      title: t('averageContinuationMonths'),
      value: `${data.averageContinuationMonths.toFixed(1)}${t('months')}`,
      color: '#10b981'
    }
  ];

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {summaryCards.map((card, index) => (
          <div key={index} style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              {card.title}
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: card.color,
              lineHeight: '1.2'
            }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}