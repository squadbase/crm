'use client';

import { useEffect, useState } from 'react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface SummaryData {
  totalAmount: string;
  unpaidAmount: string;
}

interface ServiceTypeSummary {
  serviceType: string;
  count: number;
  totalAmount: string;
}

interface SummaryResponse {
  summary: SummaryData;
  serviceTypes: ServiceTypeSummary[];
}

interface SalesSummaryProps {
  period?: {
    salesStartDt: string;
    salesEndDt: string;
  };
}

export function SalesSummary({ period }: SalesSummaryProps) {
  const { t, formatCurrency } = useClientI18n();
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams();
      if (period?.salesStartDt) {
        params.append('salesStartDt', period.salesStartDt);
      }
      if (period?.salesEndDt) {
        params.append('salesEndDt', period.salesEndDt);
      }
      
      const url = `/api/orders/summary${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch {
      // Failed to fetch sales summary data
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
        {[1, 2].map((i) => (
          <div key={`loading-sales-${i}`} style={{
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

  const { summary } = data;
  // const { serviceTypes } = data; // Currently not used

  const summaryCards = [
    {
      title: t('totalSales'),
      value: formatAmount(summary.totalAmount || 0),
      color: '#059669'
    },
    {
      title: t('unpaidAmount'),
      value: formatAmount(summary.unpaidAmount || 0),
      color: '#ef4444'
    }
  ];

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Basic summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {summaryCards.map((card, index) => (
          <div key={`sales-card-${index}`} style={{
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