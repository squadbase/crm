'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Users, ShoppingCart, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
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
  totalRevenue: MetricData;
  totalOrders: MetricData;
  totalCustomers: MetricData;
  unpaidOrders: MetricData;
  unpaidRate: MetricData;
}

interface MetricsResponse {
  metrics: MetricsData;
  previousPeriod: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    unpaidOrders: number;
    unpaidRate: number;
  };
}

interface MetricsCardsProps {
  period?: {
    startDate: string;
    endDate: string;
  };
}

export function MetricsCards({ period }: MetricsCardsProps) {
  const { t, formatCurrency } = useClientI18n();
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters if period is provided
      const queryParams = new URLSearchParams();
      if (period?.startDate) {
        queryParams.set('startDate', period.startDate);
      }
      if (period?.endDate) {
        queryParams.set('endDate', period.endDate);
      }
      
      const url = `/api/dashboard/metrics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch metrics data:', error);
    } finally {
      setLoading(false);
    }
  };


  const formatGrowth = (growth: MetricGrowth, isRevenue: boolean = false, isRate: boolean = false, isUnpaid: boolean = false) => {
    if (!growth || typeof growth.rate !== 'number' || typeof growth.count !== 'number') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' }}>
          <TrendingUp size={14} />
          <span style={{ fontSize: '12px', fontWeight: '500' }}>
            {t('noDataText')}
          </span>
        </div>
      );
    }

    const { rate, count } = growth;
    const isPositive = rate >= 0;
    
    // 未払い系の場合は良し悪しの色を逆転
    const actuallyPositive = isUnpaid ? !isPositive : isPositive;
    const icon = isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
    const color = actuallyPositive ? '#10b981' : '#ef4444';
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color }}>
        {icon}
        <span style={{ fontSize: '12px', fontWeight: '500' }}>
          {sign}{rate.toFixed(1)}% ({countDisplay})
        </span>
      </div>
    );
  };

  const metricsConfig = [
    {
      key: 'totalRevenue' as keyof MetricsData,
      title: t('totalRevenue'),
      icon: DollarSign,
      iconColor: '#16a34a',
      iconBg: '#dcfce7',
      formatter: formatCurrency,
      isRevenue: true,
      isRate: false,
      isUnpaid: false
    },
    {
      key: 'totalCustomers' as keyof MetricsData,
      title: t('totalCustomers'),
      icon: Users,
      iconColor: '#2563eb',
      iconBg: '#dbeafe',
      formatter: (value: number) => `${value.toLocaleString()}${t('people')}`,
      isRevenue: false,
      isRate: false,
      isUnpaid: false
    },
    {
      key: 'totalOrders' as keyof MetricsData,
      title: t('totalOrders'),
      icon: ShoppingCart,
      iconColor: '#f97316',
      iconBg: '#fed7aa',
      formatter: (value: number) => `${value.toLocaleString()}${t('orders_unit')}`,
      isRevenue: false,
      isRate: false,
      isUnpaid: false
    }
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '16px', 
        marginBottom: '20px' 
      }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '16px', 
        marginBottom: '20px' 
      }}>
        {metricsConfig.map((config) => (
          <div key={config.key} style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>{t('noData')}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
      gap: '16px', 
      marginBottom: '20px' 
    }}>
      {metricsConfig.map((config) => {
        const metric = data.metrics[config.key];
        const Icon = config.icon;
        
        return (
          <div key={config.key} style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', margin: 0 }}>
                  {config.title}
                </p>
                <p style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', marginTop: '4px', margin: 0 }}>
                  {metric && metric.value !== undefined && metric.value !== null ? config.formatter(typeof metric.value === 'string' ? parseInt(metric.value) : metric.value) : t('noData')}
                </p>
              </div>
              <div style={{ 
                height: '40px', 
                width: '40px', 
                backgroundColor: config.iconBg, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Icon style={{ height: '20px', width: '20px', color: config.iconColor }} />
              </div>
            </div>
            <div style={{ marginTop: '8px' }}>
              {metric && metric.growth ? formatGrowth(metric.growth, config.isRevenue, config.isRate, config.isUnpaid) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' }}>
                  <TrendingUp size={14} />
                  <span style={{ fontSize: '12px', fontWeight: '500' }}>
                    {t('noData')}
                  </span>
                </div>
              )}
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>
                {t('vsLastMonth')}
              </p>
            </div>
          </div>
        );
      })}
      
      {/* 未払い統合カード */}
      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #e2e8f0', 
        borderRadius: '8px', 
        padding: '16px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', margin: 0 }}>
              {t('unpaidOrders')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                  {data.metrics.unpaidOrders && data.metrics.unpaidOrders.value !== undefined && data.metrics.unpaidOrders.value !== null
                    ? `${(typeof data.metrics.unpaidOrders.value === 'string' ? parseInt(data.metrics.unpaidOrders.value) : data.metrics.unpaidOrders.value).toLocaleString()}${t('orders_unit')}` 
                    : t('noData')}
                </p>
                <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>{t('unpaidOrders')}</p>
              </div>
              <div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                  {data.metrics.unpaidRate && data.metrics.unpaidRate.value !== undefined && data.metrics.unpaidRate.value !== null
                    ? `${(typeof data.metrics.unpaidRate.value === 'string' ? parseFloat(data.metrics.unpaidRate.value) : data.metrics.unpaidRate.value).toFixed(1)}${t('percent')}` 
                    : t('noData')}
                </p>
                <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>{t('unpaidRate')}</p>
              </div>
            </div>
          </div>
          <div style={{ 
            height: '40px', 
            width: '40px', 
            backgroundColor: '#fee2e2', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <AlertTriangle style={{ height: '20px', width: '20px', color: '#ef4444' }} />
          </div>
        </div>
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              {data.metrics.unpaidOrders && data.metrics.unpaidOrders.growth ? formatGrowth(data.metrics.unpaidOrders.growth, false, false, true) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' }}>
                  <TrendingUp size={12} />
                  <span style={{ fontSize: '10px', fontWeight: '500' }}>{t('noDataText')}</span>
                </div>
              )}
              <p style={{ fontSize: '9px', color: '#6b7280', margin: '2px 0 0 0' }}>{t('orders')}{t('countVsLastMonth')}</p>
            </div>
            <div style={{ flex: 1 }}>
              {data.metrics.unpaidRate && data.metrics.unpaidRate.growth ? formatGrowth(data.metrics.unpaidRate.growth, false, true, true) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' }}>
                  <TrendingUp size={12} />
                  <span style={{ fontSize: '10px', fontWeight: '500' }}>{t('noDataText')}</span>
                </div>
              )}
              <p style={{ fontSize: '9px', color: '#6b7280', margin: '2px 0 0 0' }}>{t('rateVsLastMonth')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}