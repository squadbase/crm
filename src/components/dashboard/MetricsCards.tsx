'use client';

import { useEffect, useState, useCallback } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface MetricGrowth {
  rate: number;
  count: number;
}

interface MetricData {
  value: number;
  growth: MetricGrowth;
}

interface MetricsData {
  currentMonthRevenue: MetricData;
  onetimeRevenue: MetricData;
  subscriptionRevenue: MetricData;
  onetimeOrderCount: MetricData;
  subscriptionOrderCount: MetricData;
  totalCustomers: MetricData;
  onetimeAvgOrderValue: MetricData;
  subscriptionAvgValue: MetricData;
}

interface MetricsResponse {
  metrics: MetricsData;
}

interface MetricsCardsProps {
  period: {
    startDate: string;
    endDate: string;
  };
}

export function MetricsCards({ period }: MetricsCardsProps) {
  const { t, formatCurrency } = useClientI18n();
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call API with period parameters
      let url = '/api/dashboard/metrics';
      if (period.startDate && period.endDate) {
        url += `?startDate=${period.startDate}&endDate=${period.endDate}`;
      }
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch {
      // Failed to fetch metrics data
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatGrowth = (growth: MetricGrowth, isRevenue: boolean = false, isRate: boolean = false, isUnpaid: boolean = false) => {
    if (!growth || typeof growth.rate !== 'number' || typeof growth.count !== 'number') {
      return (
        <div className="flex items-center gap-1 text-gray-500">
          <TrendingUp size={14} />
          <span className="text-xs font-medium">
            {t('noDataText')}
          </span>
        </div>
      );
    }

    const { rate, count } = growth;
    const isPositive = rate >= 0;
    
    // Reverse color logic for unpaid metrics (less is better)
    const actuallyPositive = isUnpaid ? !isPositive : isPositive;
    const icon = isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
    const color = actuallyPositive ? '#059669' : '#ef4444';
    const sign = isPositive ? '+' : '';
    
    let countDisplay = '';
    if (isRate) {
      countDisplay = `${sign}${count.toFixed(1)}%`;
    } else if (isRevenue) {
      countDisplay = `${sign}${formatCurrency(count)}`;
    } else {
      countDisplay = `${sign}${count.toLocaleString()}`;
    }
    
    return (
      <div className="flex items-center gap-1" style={{ color }}>
        {icon}
        <span className="text-xs font-medium">
          {sign}{rate.toFixed(1)}% ({countDisplay})
        </span>
      </div>
    );
  };

  const metricsConfig = [
    {
      key: 'currentMonthRevenue' as keyof MetricsData,
      title: t('currentMonthRevenue'),
      icon: DollarSign,
      iconColor: '#16a34a',
      iconBg: '#dcfce7',
      formatter: formatCurrency,
      isRevenue: true,
      isRate: false,
      isUnpaid: false
    },
    {
      key: 'onetimeRevenue' as keyof MetricsData,
      title: t('onetimeRevenue'),
      icon: ShoppingCart,
      iconColor: '#f97316',
      iconBg: '#fed7aa',
      formatter: formatCurrency,
      isRevenue: true,
      isRate: false,
      isUnpaid: false
    },
    {
      key: 'subscriptionRevenue' as keyof MetricsData,
      title: t('subscriptionRevenue'),
      icon: DollarSign,
      iconColor: '#8b5cf6',
      iconBg: '#f3e8ff',
      formatter: formatCurrency,
      isRevenue: true,
      isRate: false,
      isUnpaid: false
    },
    {
      key: 'subscriptionAvgValue' as keyof MetricsData,
      title: t('subscriptionAvgValue'),
      icon: DollarSign,
      iconColor: '#8b5cf6',
      iconBg: '#f3e8ff',
      formatter: formatCurrency,
      isRevenue: true,
      isRate: false,
      isUnpaid: false
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={`loading-metric-${i}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm h-25 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {metricsConfig.map((config, index) => (
          <div key={`no-data-${config.key}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm h-25 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="m-0 text-sm">{t('noData')}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // getPeriodDisplay function removed as it was unused

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {metricsConfig.map((config, index) => {
        const metric = data.metrics[config.key];
        const Icon = config.icon;
        
        return (
          <div key={`metric-${config.key}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-h-[100px]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-gray-500 m-0">
                  {config.title}
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5 m-0">
                  {metric && metric.value !== undefined && metric.value !== null ? config.formatter(typeof metric.value === 'string' ? parseInt(metric.value) : metric.value) : t('noData')}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: config.iconBg }}>
                <Icon className="h-4 w-4" style={{ color: config.iconColor }} />
              </div>
            </div>
            <div className="mt-1.5">
              {metric && metric.growth ? formatGrowth(metric.growth, config.isRevenue, config.isRate, config.isUnpaid) : (
                <div className="flex items-center gap-1 text-gray-500">
                  <TrendingUp size={14} />
                  <span className="text-xs font-medium">
                    {t('noData')}
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-0.5 mb-0">
                {t('vsLastMonth')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}