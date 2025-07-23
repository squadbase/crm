'use client';

import { ArrowUpRight, Calendar, CreditCard } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';
import { useState, useEffect } from 'react';

interface Order {
  orderId: string;
  customerName: string | null;
  amount: string;
  paymentType: string;
  serviceType: string;
  isPaid: boolean;
  salesStartDt: Date | null;
  description: string | null;
}

export function RecentOrders({ orders: recentOrders, loading }: { orders: Order[]; loading: boolean }) {
  const { t, formatCurrency, formatDate } = useClientI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{t('recentOrders')}</h3>
        <button 
          onClick={() => window.location.href = '/orders'}
          className="flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-transparent border-none rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
        >
          {t('viewAll')}
          <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-8 h-8 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : recentOrders.length === 0 ? (
        <div className="text-center py-10 px-5 text-gray-500">
          <p className="text-sm m-0">
            {t('noOrdersFound')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recentOrders.map((order, index) => (
          <div
            key={`recent-order-${order.orderId}-${index}`}
            className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 transition-colors bg-transparent hover:bg-gray-50"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-medium text-xs text-slate-900 m-0 overflow-hidden text-ellipsis whitespace-nowrap">
                  {order.customerName}
                </p>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded text-white" style={{
                  backgroundColor: order.isPaid ? '#059669' : '#ef4444'
                }}>
                  {order.isPaid ? t('paid') : t('unpaid')}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 mb-0 overflow-hidden text-ellipsis whitespace-nowrap">
                {order.description}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {order.paymentType === 'subscription' ? t('subscription') : t('oneTime')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {order.salesStartDt ? (mounted ? formatDate(order.salesStartDt) : (() => {
                      const date = new Date(order.salesStartDt);
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      return `${year}/${month}/${day}`;
                    })()) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-900 m-0">
                {formatCurrency(Number(order.amount))}
              </p>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded text-white mt-1 inline-block" style={{
                backgroundColor: order.serviceType === 'product' ? '#2563eb' : '#64748b'
              }}>
                {order.serviceType === 'product' ? t('productService') : t('projectService')}
              </span>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}