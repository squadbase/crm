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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 mb-5">
        {[1, 2, 3].map((i) => (
          <div key={`loading-summary-${i}`} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-25 flex items-center justify-center">
            <div className="w-15 h-5 bg-slate-100 rounded animate-pulse" />
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
    <div className="mb-5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 mb-5">
        {summaryCards.map((card, index) => (
          <div key={`summary-card-${index}`} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-2">
              {card.title}
            </div>
            <div 
              className="text-2xl font-bold leading-tight"
              style={{ color: card.color }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}