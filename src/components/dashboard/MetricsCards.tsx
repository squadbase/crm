'use client';

import { useEffect, useState } from 'react';
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

// MetricsCards コンポーネントはプロパティを受け取らない

export function MetricsCards() {
  const { t, formatCurrency } = useClientI18n();
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 期間パラメータは不要 - 常に最新のメトリクスを取得
      const response = await fetch('/api/dashboard/metrics');
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#6b7280'
        }}>
          <TrendingUp size={14} />
          <span style={{
            fontSize: '12px',
            fontWeight: '500'
          }}>
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: color
      }}>
        {icon}
        <span style={{
          fontSize: '12px',
          fontWeight: '500'
        }}>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {metricsConfig.map((config) => (
          <div key={config.key} style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              textAlign: 'center',
              color: '#6b7280'
            }}>
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
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            minHeight: '100px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {config.title}
                </p>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginTop: '2px',
                  margin: 0
                }}>
                  {metric && metric.value !== undefined && metric.value !== null ? config.formatter(typeof metric.value === 'string' ? parseInt(metric.value) : metric.value) : t('noData')}
                </p>
              </div>
              <div style={{
                height: '32px',
                width: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: config.iconBg
              }}>
                <Icon style={{
                  height: '16px',
                  width: '16px',
                  color: config.iconColor
                }} />
              </div>
            </div>
            <div style={{ marginTop: '6px' }}>
              {metric && metric.growth ? formatGrowth(metric.growth, config.isRevenue, config.isRate, config.isUnpaid) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#6b7280'
                }}>
                  <TrendingUp size={14} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {t('noData')}
                  </span>
                </div>
              )}
              <p style={{
                fontSize: '11px',
                color: '#6b7280',
                marginTop: '2px',
                marginBottom: 0
              }}>
                {t('vsLastMonth')}
              </p>
            </div>
          </div>
        );
      })}
      
    </div>
  );
}