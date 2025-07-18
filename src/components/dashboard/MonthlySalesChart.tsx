'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface MonthlySalesData {
  month: string;
  totalAmount: number;
  projectAmount: number;
  squadbaseAmount: number;
  orderCount: number;
  projectCount: number;
  squadbaseCount: number;
}

interface MonthlySalesResponse {
  monthlySales: MonthlySalesData[];
  summary: {
    totalPeriodSales: number;
    totalProjectSales: number;
    totalSquadbaseSales: number;
    totalOrders: number;
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
    barType: 'total' | 'project' | 'squadbase';
  } | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (period.startDate) params.append('startDate', period.startDate);
      if (period.endDate) params.append('endDate', period.endDate);

      const response = await fetch(`/api/dashboard/monthly-sales?${params}`);
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

  if (!data || data.monthlySales.length === 0) {
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
  // const chartWidth = '100%'; // Currently not used
  const chartHeight = 350;
  const padding = { top: 20, right: 80, bottom: 60, left: 120 };
  const graphWidth = 900 - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // 最大値を計算
  const maxAmount = Math.max(...monthlySales.map(item => item.totalAmount));
  const yAxisMax = Math.ceil(maxAmount * 1.1 / 100000) * 100000; // 10万円単位で切り上げ

  // 棒グラフ用の座標計算関数
  const barWidth = graphWidth / monthlySales.length * 0.8; // 棒の幅（80%使用）
  // const barSpacing = graphWidth / monthlySales.length * 0.2; // 棒の間隔（20%使用） // Currently not used
  const groupWidth = barWidth / 3; // 各グループ内の棒の幅
  
  const getBarX = (index: number, groupIndex: number) => {
    const centerX = padding.left + (index + 0.5) * (graphWidth / monthlySales.length);
    const groupStartX = centerX - barWidth / 2;
    return groupStartX + groupIndex * groupWidth;
  };
  
  const getBarY = (amount: number) => padding.top + graphHeight - (amount / yAxisMax) * graphHeight;
  const getBarHeight = (amount: number) => (amount / yAxisMax) * graphHeight;

  const getBarColor = (baseColor: string, monthIndex: number, barType: 'total' | 'project' | 'squadbase') => {
    const isHovered = hoveredBar?.monthIndex === monthIndex && hoveredBar?.barType === barType;
    if (isHovered) {
      // ホバー時に明るくする
      const colors = {
        '#2563eb': '#3b82f6', // 青系
        '#059669': '#10b981', // 緑系
        '#dc2626': '#ef4444'  // 赤系
      };
      return colors[baseColor as keyof typeof colors] || baseColor;
    }
    return baseColor;
  };

  const getTooltipContent = (item: MonthlySalesData, barType: 'total' | 'project' | 'squadbase') => {
    const values = {
      total: item.totalAmount,
      project: item.projectAmount,
      squadbase: item.squadbaseAmount
    };
    const labels = {
      total: '合計',
      project: 'プロジェクト',
      squadbase: 'Squadbase'
    };
    return {
      label: labels[barType],
      value: formatCurrency(values[barType]),
      month: formatMonth(item.month)
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
              backgroundColor: '#2563eb',
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '12px', color: '#374151' }}>{t('total')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#059669',
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '12px', color: '#374151' }}>{t('project')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#dc2626',
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '12px', color: '#374151' }}>{t('squadbase')}</span>
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
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>{t('project')}</p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#059669', margin: 0 }}>
            {formatCurrency(summary.totalProjectSales)}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>{t('squadbase')}</p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626', margin: 0 }}>
            {formatCurrency(summary.totalSquadbaseSales)}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>{t('totalOrders')}</p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: 0 }}>
            {summary.totalOrders}{t('orders_unit')}
          </p>
        </div>
      </div>

      {/* グラフ */}
      <div style={{ overflowX: 'auto', position: 'relative', width: '100%' }}>
        <svg width="100%" height={chartHeight} style={{ display: 'block', minWidth: '900px' }} viewBox="0 0 900 350" preserveAspectRatio="none">
          {/* 背景グリッド */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="900" height="350" fill="url(#grid)" />

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
          {monthlySales.map((item, index) => {
            const centerX = padding.left + (index + 0.5) * (graphWidth / monthlySales.length);
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

          {/* 棒グラフ */}
          {monthlySales.map((item, index) => {
            return (
              <g key={index}>
                {/* 合計の棒 */}
                <rect
                  x={getBarX(index, 0)}
                  y={getBarY(item.totalAmount)}
                  width={groupWidth}
                  height={getBarHeight(item.totalAmount)}
                  fill={getBarColor('#2563eb', index, 'total')}
                  rx="2"
                  style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                  onMouseEnter={() => setHoveredBar({ monthIndex: index, barType: 'total' })}
                  onMouseLeave={() => setHoveredBar(null)}
                />
                {/* プロジェクトの棒 */}
                <rect
                  x={getBarX(index, 1)}
                  y={getBarY(item.projectAmount)}
                  width={groupWidth}
                  height={getBarHeight(item.projectAmount)}
                  fill={getBarColor('#059669', index, 'project')}
                  rx="2"
                  style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                  onMouseEnter={() => setHoveredBar({ monthIndex: index, barType: 'project' })}
                  onMouseLeave={() => setHoveredBar(null)}
                />
                {/* Squadbaseの棒 */}
                <rect
                  x={getBarX(index, 2)}
                  y={getBarY(item.squadbaseAmount)}
                  width={groupWidth}
                  height={getBarHeight(item.squadbaseAmount)}
                  fill={getBarColor('#dc2626', index, 'squadbase')}
                  rx="2"
                  style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                  onMouseEnter={() => setHoveredBar({ monthIndex: index, barType: 'squadbase' })}
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
              top: getBarY(monthlySales[hoveredBar.monthIndex]?.[
                hoveredBar.barType === 'total' ? 'totalAmount' : 
                hoveredBar.barType === 'project' ? 'projectAmount' : 'squadbaseAmount'
              ] || 0) - 60,
              left: getBarX(hoveredBar.monthIndex, 
                hoveredBar.barType === 'total' ? 0 : 
                hoveredBar.barType === 'project' ? 1 : 2) + groupWidth / 2,
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
                  <div>
                    <span style={{ marginRight: '8px' }}>{tooltip.label}:</span>
                    <span style={{ fontWeight: '600' }}>{tooltip.value}</span>
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