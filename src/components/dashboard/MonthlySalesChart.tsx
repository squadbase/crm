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
  // Detailed breakdown
  onetimePaidAmount: number;
  onetimeUnpaidAmount: number;
  subscriptionPaidAmount: number;
  subscriptionUnpaidAmount: number;
  futureSubscriptionAmount: number;
}

interface MonthlySalesResponse {
  monthlySales: MonthlySalesData[];
  summary: {
    totalPeriodSales: number;
    totalOnetimeSales: number;
    totalSubscriptionSales: number;
    totalOnetimePaidSales: number;
    totalOnetimeUnpaidSales: number;
    totalSubscriptionPaidSales: number;
    totalSubscriptionUnpaidSales: number;
    totalFutureSubscriptionSales: number;
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
    barType: 'onetimePaid' | 'onetimeUnpaid' | 'subscriptionPaid' | 'subscriptionUnpaid' | 'futureSubscription';
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
    } catch {
      // Failed to fetch monthly sales data
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
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-96 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.monthlySales || data.monthlySales.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <TrendingUp size={48} className="mx-auto mb-4 block" />
          <p className="m-0 text-base">{t('noData')}</p>
          <p className="mt-2 mb-0 text-sm">{t('noData')}</p>
        </div>
      </div>
    );
  }

  const { monthlySales, summary } = data;

  // Graph drawing settings
  const chartHeight = 350;
  const padding = { top: 20, right: 80, bottom: 60, left: 120 };
  
  // Dynamic width calculation: adjust chart width based on data volume
  const minChartWidth = 900;
  const minWidthPerMonth = 15; // Minimum width per month
  const dynamicWidth = monthlySales && monthlySales.length > 0 
    ? Math.max(minChartWidth, monthlySales.length * minWidthPerMonth + padding.left + padding.right)
    : minChartWidth;
  
  const graphWidth = dynamicWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Calculate maximum value - prevent errors when data is empty
  const maxAmount = monthlySales && monthlySales.length > 0 ? Math.max(...monthlySales.map(item => item.totalAmount)) : 0;
  const yAxisMax = Math.ceil(maxAmount * 1.1 / 100000) * 100000; // Round up to 100,000 units

  // Coordinate calculation function for bar chart (stack format)
  const barWidth = monthlySales && monthlySales.length > 0 ? graphWidth / monthlySales.length * 0.6 : 0; // Bar width (60% usage)
  
  const getBarX = (index: number) => {
    const length = monthlySales && monthlySales.length > 0 ? monthlySales.length : 1;
    const centerX = padding.left + (index + 0.5) * (graphWidth / length);
    return centerX - barWidth / 2;
  };
  
  const getBarY = (amount: number) => padding.top + graphHeight - (amount / yAxisMax) * graphHeight;
  const getBarHeight = (amount: number) => (amount / yAxisMax) * graphHeight;

  // Color definitions for each category
  const colors = {
    onetimePaid: '#f97316',       // Orange-500 (paid onetime)
    onetimeUnpaid: '#fed7aa',     // Orange-200 (unpaid onetime)
    subscriptionPaid: '#8b5cf6',  // Violet-500 (paid subscription)
    subscriptionUnpaid: '#c4b5fd', // Violet-300 (unpaid subscription)
    futureSubscription: '#3b82f6', // Blue-500 (future subscription)
  };

  const hoverColors = {
    onetimePaid: '#fb923c',       // Orange-400 (hover)
    onetimeUnpaid: '#fbbf24',     // Orange-400 (hover)
    subscriptionPaid: '#a78bfa',  // Violet-400 (hover)
    subscriptionUnpaid: '#ddd6fe', // Violet-200 (hover)
    futureSubscription: '#60a5fa', // Blue-400 (hover)
  };

  const getBarColor = (barType: 'onetimePaid' | 'onetimeUnpaid' | 'subscriptionPaid' | 'subscriptionUnpaid' | 'futureSubscription', monthIndex: number) => {
    const isHovered = hoveredBar?.monthIndex === monthIndex && hoveredBar?.barType === barType;
    return isHovered ? hoverColors[barType] : colors[barType];
  };

  const getTooltipContent = (item: MonthlySalesData, barType: 'onetimePaid' | 'onetimeUnpaid' | 'subscriptionPaid' | 'subscriptionUnpaid' | 'futureSubscription') => {
    const values = {
      onetimePaid: item.onetimePaidAmount,
      onetimeUnpaid: item.onetimeUnpaidAmount,
      subscriptionPaid: item.subscriptionPaidAmount,
      subscriptionUnpaid: item.subscriptionUnpaidAmount,
      futureSubscription: item.futureSubscriptionAmount,
    };
    const labels = {
      onetimePaid: t('onetimePaid'),
      onetimeUnpaid: t('onetimeUnpaid'),
      subscriptionPaid: t('subscriptionPaid'),
      subscriptionUnpaid: t('subscriptionUnpaid'),
      futureSubscription: t('futureSubscription'),
    };
    return {
      label: labels[barType],
      value: formatCurrency(values[barType]),
      month: formatMonth(item.month),
      total: formatCurrency(item.totalAmount)
    };
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 m-0 mb-1">
            {t('monthlySales')}
          </h3>
          <p className="text-sm text-gray-500 m-0">
            {t('monthlySalesDescription')}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.onetimePaid }} />
            <span className="text-xs text-gray-700">{t('onetimePaid')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.onetimeUnpaid }} />
            <span className="text-xs text-gray-700">{t('onetimeUnpaid')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.subscriptionPaid }} />
            <span className="text-xs text-gray-700">{t('subscriptionPaid')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.subscriptionUnpaid }} />
            <span className="text-xs text-gray-700">{t('subscriptionUnpaid')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.futureSubscription }} />
            <span className="text-xs text-gray-700">{t('futureSubscription')}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-500 m-0 mb-1">{t('total')}</p>
          <p className="text-sm font-semibold text-blue-600 m-0">
            {formatCurrency(summary.totalPeriodSales)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 m-0 mb-1">{t('onetimePaid')}</p>
          <p className="text-sm font-semibold m-0" style={{ color: colors.onetimePaid }}>
            {formatCurrency(summary.totalOnetimePaidSales)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 m-0 mb-1">{t('onetimeUnpaid')}</p>
          <p className="text-sm font-semibold m-0" style={{ color: colors.onetimeUnpaid }}>
            {formatCurrency(summary.totalOnetimeUnpaidSales)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 m-0 mb-1">{t('subscriptionPaid')}</p>
          <p className="text-sm font-semibold m-0" style={{ color: colors.subscriptionPaid }}>
            {formatCurrency(summary.totalSubscriptionPaidSales)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 m-0 mb-1">{t('subscriptionUnpaid')}</p>
          <p className="text-sm font-semibold m-0" style={{ color: colors.subscriptionUnpaid }}>
            {formatCurrency(summary.totalSubscriptionUnpaidSales)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 m-0 mb-1">{t('futureSubscription')}</p>
          <p className="text-sm font-semibold m-0" style={{ color: colors.futureSubscription }}>
            {formatCurrency(summary.totalFutureSubscriptionSales)}
          </p>
        </div>
      </div>

      {/* Graph */}
      <div className="overflow-x-auto relative w-full">
        <svg width="100%" height={chartHeight} style={{ display: 'block', minWidth: `${dynamicWidth}px` }} viewBox={`0 0 ${dynamicWidth} 350`} preserveAspectRatio="none">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width={dynamicWidth} height="350" fill="url(#grid)" />

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding.top + graphHeight - (ratio * graphHeight);
            const value = yAxisMax * ratio;
            return (
              <g key={`y-axis-${index}`}>
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

          {/* X-axis labels */}
          {monthlySales && monthlySales.map((item, index) => {
            const length = monthlySales.length;
            const centerX = padding.left + (index + 0.5) * (graphWidth / length);
            
            // Dynamically adjust label display interval (prevent text overlap)
            
            let shouldShowLabel = false;
            
            if (length <= 12) {
              // Display all if 12 months or less
              shouldShowLabel = true;
            } else if (length <= 24) {
              // Every 2 months for 13-24 months
              shouldShowLabel = index % 2 === 0;
            } else if (length <= 36) {
              // Every 3 months for 25-36 months
              shouldShowLabel = index % 3 === 0;
            } else if (length <= 60) {
              // Every 4 months for 37-60 months
              shouldShowLabel = index % 4 === 0;
            } else if (length <= 72) {
              // Every 6 months for 61-72 months
              shouldShowLabel = index % 6 === 0;
            } else {
              // Yearly (every 12 months) for 73+ months
              shouldShowLabel = index % 12 === 0;
            }
            
            if (!shouldShowLabel) return null;
            
            return (
              <text
                key={`x-label-${index}`}
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

          {/* Bar chart (stack format with 5 categories) */}
          {monthlySales && monthlySales.map((item, index) => {
            const x = getBarX(index);
            
            // Calculate heights for each segment
            const onetimePaidHeight = getBarHeight(item.onetimePaidAmount);
            const onetimeUnpaidHeight = getBarHeight(item.onetimeUnpaidAmount);
            const subscriptionPaidHeight = getBarHeight(item.subscriptionPaidAmount);
            const subscriptionUnpaidHeight = getBarHeight(item.subscriptionUnpaidAmount);
            const futureSubscriptionHeight = getBarHeight(item.futureSubscriptionAmount);
            
            // Calculate Y positions (stacked from bottom to top)
            let currentY = getBarY(item.totalAmount);
            const futureSubscriptionY = currentY;
            currentY += futureSubscriptionHeight;
            const subscriptionUnpaidY = currentY;
            currentY += subscriptionUnpaidHeight;
            const subscriptionPaidY = currentY;
            currentY += subscriptionPaidHeight;
            const onetimeUnpaidY = currentY;
            currentY += onetimeUnpaidHeight;
            const onetimePaidY = currentY;
            
            return (
              <g key={`bar-group-${index}`}>
                {/* Future Subscription (bottom) */}
                {item.futureSubscriptionAmount > 0 && (
                  <rect
                    x={x}
                    y={futureSubscriptionY}
                    width={barWidth}
                    height={futureSubscriptionHeight}
                    fill={getBarColor('futureSubscription', index)}
                    rx="2"
                    style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                    onMouseEnter={() => setHoveredBar({ monthIndex: index, barType: 'futureSubscription' })}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                )}
                
                {/* Subscription Unpaid */}
                {item.subscriptionUnpaidAmount > 0 && (
                  <rect
                    x={x}
                    y={subscriptionUnpaidY}
                    width={barWidth}
                    height={subscriptionUnpaidHeight}
                    fill={getBarColor('subscriptionUnpaid', index)}
                    rx="2"
                    style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                    onMouseEnter={() => setHoveredBar({ monthIndex: index, barType: 'subscriptionUnpaid' })}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                )}
                
                {/* Subscription Paid */}
                {item.subscriptionPaidAmount > 0 && (
                  <rect
                    x={x}
                    y={subscriptionPaidY}
                    width={barWidth}
                    height={subscriptionPaidHeight}
                    fill={getBarColor('subscriptionPaid', index)}
                    rx="2"
                    style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                    onMouseEnter={() => setHoveredBar({ monthIndex: index, barType: 'subscriptionPaid' })}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                )}
                
                {/* Onetime Unpaid */}
                {item.onetimeUnpaidAmount > 0 && (
                  <rect
                    x={x}
                    y={onetimeUnpaidY}
                    width={barWidth}
                    height={onetimeUnpaidHeight}
                    fill={getBarColor('onetimeUnpaid', index)}
                    rx="2"
                    style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                    onMouseEnter={() => setHoveredBar({ monthIndex: index, barType: 'onetimeUnpaid' })}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                )}
                
                {/* Onetime Paid (top) */}
                {item.onetimePaidAmount > 0 && (
                  <rect
                    x={x}
                    y={onetimePaidY}
                    width={barWidth}
                    height={onetimePaidHeight}
                    fill={getBarColor('onetimePaid', index)}
                    rx="2"
                    style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                    onMouseEnter={() => setHoveredBar({ monthIndex: index, barType: 'onetimePaid' })}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Tooltip */}
        {hoveredBar && (
          <div
            className="absolute bg-black/80 text-white px-3 py-2 rounded-md text-xs whitespace-nowrap pointer-events-none z-[1000] shadow-lg transform -translate-x-1/2"
            style={{
              top: (() => {
                const item = monthlySales[hoveredBar.monthIndex];
                let currentY = getBarY(item?.totalAmount || 0);
                
                // Calculate the middle position of the hovered bar segment
                switch (hoveredBar.barType) {
                  case 'futureSubscription':
                    return currentY + getBarHeight(item?.futureSubscriptionAmount || 0) / 2 - 30;
                  case 'subscriptionUnpaid':
                    currentY += getBarHeight(item?.futureSubscriptionAmount || 0);
                    return currentY + getBarHeight(item?.subscriptionUnpaidAmount || 0) / 2 - 30;
                  case 'subscriptionPaid':
                    currentY += getBarHeight(item?.futureSubscriptionAmount || 0) + getBarHeight(item?.subscriptionUnpaidAmount || 0);
                    return currentY + getBarHeight(item?.subscriptionPaidAmount || 0) / 2 - 30;
                  case 'onetimeUnpaid':
                    currentY += getBarHeight(item?.futureSubscriptionAmount || 0) + getBarHeight(item?.subscriptionUnpaidAmount || 0) + getBarHeight(item?.subscriptionPaidAmount || 0);
                    return currentY + getBarHeight(item?.onetimeUnpaidAmount || 0) / 2 - 30;
                  case 'onetimePaid':
                    currentY += getBarHeight(item?.futureSubscriptionAmount || 0) + getBarHeight(item?.subscriptionUnpaidAmount || 0) + getBarHeight(item?.subscriptionPaidAmount || 0) + getBarHeight(item?.onetimeUnpaidAmount || 0);
                    return currentY + getBarHeight(item?.onetimePaidAmount || 0) / 2 - 30;
                  default:
                    return currentY - 80;
                }
              })(),
              left: getBarX(hoveredBar.monthIndex) + barWidth / 2,
            }}
          >
            {(() => {
              const tooltip = getTooltipContent(monthlySales[hoveredBar.monthIndex], hoveredBar.barType);
              return (
                <div>
                  <div className="mb-1 font-semibold">{tooltip.month}</div>
                  <div className="mb-0.5">
                    <span className="mr-2">{tooltip.label}:</span>
                    <span className="font-semibold">{tooltip.value}</span>
                  </div>
                  <div className="text-xs text-gray-300">
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