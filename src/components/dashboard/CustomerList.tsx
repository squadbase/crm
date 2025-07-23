'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, Building, Calendar, ShoppingBag } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface Customer {
  customerId: string;
  customerName: string;
  orderCount: number;
  totalRevenue: number | null;
  createdAt: Date;
}

export function CustomerList({ customers: customerStats, loading }: { customers: Customer[]; loading: boolean }) {
  const { t, formatCurrency, formatDate } = useClientI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{t('topCustomers')}</h3>
        <button 
          onClick={() => window.location.href = '/customers'}
          className="flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-transparent border-none rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
        >
          {t('allCustomers')}
          <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-8 h-8 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : customerStats.length === 0 ? (
        <div className="text-center py-10 px-5 text-gray-500">
          <p className="text-sm m-0">
            {t('noData')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {customerStats.map((customer, index) => (
          <div
            key={`customer-stat-${customer.customerId}-${index}`}
            className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 transition-colors bg-transparent hover:bg-gray-50"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 bg-blue-50 rounded-full">
                <Building className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-xs text-slate-900 block overflow-hidden text-ellipsis whitespace-nowrap">
                  {customer.customerName}
                </span>
                <div className="flex items-center gap-3 mt-0.5">
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {customer.orderCount}{t('orders_unit')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {mounted ? formatDate(customer.createdAt) : (() => {
                        const date = new Date(customer.createdAt);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}/${month}/${day}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-900 m-0">
                {formatCurrency(customer.totalRevenue || 0)}
              </p>
              <p className="text-xs text-gray-500 m-0">
                {t('revenue')}
              </p>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}