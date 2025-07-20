'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface MonthlySalesData {
  month: string;
  totalAmount: number;
  onetimeAmount: number;
  subscriptionAmount: number;
  year: number;
  monthNum: number;
}

interface MonthlySalesResponse {
  monthlySales: MonthlySalesData[];
  summary: {
    totalPeriodSales: number;
    totalOnetimeSales: number;
    totalSubscriptionSales: number;
    monthCount: number;
  };
}

interface MonthlySalesChartProps {
  period: {
    startDate: string;
    endDate: string;
  };
}

export function MonthlySalesChart({ period }: MonthlySalesChartProps) {
  const { t, formatCurrency } = useClientI18n();
  const [data, setData] = useState<MonthlySalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<{
    monthIndex: number;
    barType: 'onetime' | 'subscription';
  } | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = '/api/dashboard/monthly-sales';
      if (period.startDate && period.endDate) {
        url += `?startDate=${period.startDate}&endDate=${period.endDate}`;
      }
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch monthly sales data:', error);
    } finally {
      setLoading(false);
    }
  };


  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    return `${year}/${monthNum}`;
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        height: '400px',
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
    );
  }

  if (!data || !data.monthlySales || data.monthlySales.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <TrendingUp size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
          <p style={{ margin: 0, fontSize: '16px' }}>{t('noData')}</p>
          <p style={{ margin: '8px 0 0', fontSize: '14px' }}>{t('noData')}</p>
        </div>
      </div>
    );
  }

  const { monthlySales, summary } = data;

  // グラフの描画設定
  const chartHeight = 350;
  const padding = { top: 20, right: 80, bottom: 60, left: 120 };
  
  // 動的な幅計算：データ量に応じてチャート幅を調整
  const minChartWidth = 900;
  const minWidthPerMonth = 15; // 月あたりの最小幅
  const dynamicWidth = monthlySales && monthlySales.length > 0 
    ? Math.max(minChartWidth, monthlySales.length * minWidthPerMonth + padding.left + padding.right)
    : minChartWidth;
  
  const graphWidth = dynamicWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // 最大値を計算 - データが空の場合のエラーを防ぐ
  const maxAmount = monthlySales && monthlySales.length > 0 ? Math.max(...monthlySales.map(item => item.totalAmount)) : 0;
  const yAxisMax = Math.ceil(maxAmount * 1.1 / 100000) * 100000; // 10万円単位で切り上げ

  // 棒グラフ用の座標計算関数（スタック形式）
  const barWidth = monthlySales && monthlySales.length > 0 ? graphWidth / monthlySales.length * 0.6 : 0; // 棒の幅（60%使用）
  
  const getBarX = (index: number) => {
    const length = monthlySales && monthlySales.length > 0 ? monthlySales.length : 1;
    const centerX = padding.left + (index + 0.5) * (graphWidth / length);
    return centerX - barWidth / 2;
  };
  
  const getBarY = (amount: number) => padding.top + graphHeight - (amount / yAxisMax) * graphHeight;
  const getBarHeight = (amount: number) => (amount / yAxisMax) * graphHeight;

  const getBarColor = (baseColor: string, monthIndex: number, barType: 'onetime' | 'subscription') => {
    const isHovered = hoveredBar?.monthIndex === monthIndex && hoveredBar?.barType === barType;
    if (isHovered) {
      // ホバー時に明るくする
      const colors = {
        '#f97316': '#fb923c', // オレンジ系
        '#8b5cf6': '#a78bfa', // 紫系
      };
      return colors[baseColor as keyof typeof colors] || baseColor;
    }
    return baseColor;
  };

  const getTooltipContent = (item: MonthlySalesData, barType: 'onetime' | 'subscription') => {
    const values = {
      onetime: item.onetimeAmount,
      subscription: item.subscriptionAmount
    };
    const labels = {
      onetime: t('onetime'),
      subscription: t('subscription')
    };
    return {
      label: labels[barType],
      value: formatCurrency(values[barType]),
      month: formatMonth(item.month),
      total: formatCurrency(item.totalAmount)
    };
  };

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0 0 4px 0'
          }}>
            {t('monthlySales')}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            {t('monthlySalesDescription')}
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#f97316',
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '12px', color: '#374151' }}>{t('onetime')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#8b5cf6',
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '12px', color: '#374151' }}>{t('subscription')}</span>
          </div>
        </div>
      </div>

      {/* サマリー */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>{t('total')}</p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb', margin: 0 }}>
            {formatCurrency(summary.totalPeriodSales)}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>{t('onetime')}</p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#f97316', margin: 0 }}>
            {formatCurrency(summary.totalOnetimeSales)}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>{t('subscription')}</p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#8b5cf6', margin: 0 }}>
            {formatCurrency(summary.totalSubscriptionSales)}
          </p>
        </div>
      </div>

      {/* グラフ */}
      <div style={{ overflowX: 'auto', position: 'relative', width: '100%' }}>
        <svg width="100%" height={chartHeight} style={{ display: 'block', minWidth: `${dynamicWidth}px` }} viewBox={`0 0 ${dynamicWidth} 350`} preserveAspectRatio="none">
          {/* 背景グリッド */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width={dynamicWidth} height="350" fill="url(#grid)" />

          {/* Y軸ラベル */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding.top + graphHeight - (ratio * graphHeight);
            const value = yAxisMax * ratio;
            return (
              <g key={index}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {formatCurrency(value)}
                </text>
              </g>
            );
          })}

          {/* X軸ラベル */}
          {monthlySales && monthlySales.map((item, index) => {
            const length = monthlySales.length;
            const centerX = padding.left + (index + 0.5) * (graphWidth / length);
            
            // ラベルの表示間隔を動的に調整（文字重複を防ぐ）
            // 各ラベルの推定幅: 約50px (YYYY/MM形式)
            const estimatedLabelWidth = 50;
            const availableWidthPerLabel = graphWidth / length;
            const optimalInterval = Math.max(1, Math.ceil(estimatedLabelWidth / availableWidthPerLabel));
            
            let shouldShowLabel = false;
            
            if (length <= 12) {
              // 12ヶ月以下の場合は全て表示
              shouldShowLabel = true;
            } else if (length <= 24) {
              // 13-24ヶ月の場合は2ヶ月おき
              shouldShowLabel = index % 2 === 0;
            } else if (length <= 36) {
              // 25-36ヶ月の場合は3ヶ月おき
              shouldShowLabel = index % 3 === 0;
            } else if (length <= 60) {
              // 37-60ヶ月の場合は4ヶ月おき
              shouldShowLabel = index % 4 === 0;
            } else if (length <= 72) {
              // 61-72ヶ月の場合は6ヶ月おき
              shouldShowLabel = index % 6 === 0;
            } else {
              // 73ヶ月以上の場合は年単位（12ヶ月おき）
              shouldShowLabel = index % 12 === 0;
            }
            
            if (!shouldShowLabel) return null;
            
            return (
              <text
                key={index}
                x={centerX}
                y={chartHeight - 20}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {formatMonth(item.month)}
              </text>
            );
          })}

          {/* 棒グラフ（スタック形式） */}
          {monthlySales && monthlySales.map((item, index) => {
            const x = getBarX(index);
            const onetimeHeight = getBarHeight(item.onetimeAmount);
            const subscriptionHeight = getBarHeight(item.subscriptionAmount);
            const onetimeY = getBarY(item.onetimeAmount);
            const subscriptionY = getBarY(item.totalAmount);
            
            return (
              <g key={index}>
                {/* Subscriptionの棒（下部） */}
                <rect
                  x={x}
                  y={subscriptionY}
                  width={barWidth}
                  height={subscriptionHeight}
                  fill={getBarColor('#8b5cf6', index, 'subscription')}
                  rx="2"
                  style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                  onMouseEnter={() => setHoveredBar({ monthIndex: index, barType: 'subscription' })}
                  onMouseLeave={() => setHoveredBar(null)}
                />
                {/* One-timeの棒（上部） */}
                <rect
                  x={x}
                  y={onetimeY}
                  width={barWidth}
                  height={onetimeHeight}
                  fill={getBarColor('#f97316', index, 'onetime')}
                  rx="2"
                  style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                  onMouseEnter={() => setHoveredBar({ monthIndex: index, barType: 'onetime' })}
                  onMouseLeave={() => setHoveredBar(null)}
                />
              </g>
            );
          })}
        </svg>
        
        {/* ツールチップ */}
        {hoveredBar && (
          <div
            style={{
              position: 'absolute',
              top: hoveredBar.barType === 'onetime' 
                ? getBarY(monthlySales[hoveredBar.monthIndex]?.onetimeAmount || 0) - 80
                : getBarY(monthlySales[hoveredBar.monthIndex]?.totalAmount || 0) + getBarHeight(monthlySales[hoveredBar.monthIndex]?.subscriptionAmount || 0) / 2 - 30,
              left: getBarX(hoveredBar.monthIndex) + barWidth / 2,
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 1000,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          >
            {(() => {
              const tooltip = getTooltipContent(monthlySales[hoveredBar.monthIndex], hoveredBar.barType);
              return (
                <div>
                  <div style={{ marginBottom: '4px', fontWeight: '600' }}>{tooltip.month}</div>
                  <div style={{ marginBottom: '2px' }}>
                    <span style={{ marginRight: '8px' }}>{tooltip.label}:</span>
                    <span style={{ fontWeight: '600' }}>{tooltip.value}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#e5e7eb' }}>
                    <span>Total: {tooltip.total}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}