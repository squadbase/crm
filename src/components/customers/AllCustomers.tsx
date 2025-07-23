'use client';

import { Building, Calendar, Edit, Trash2 } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface Customer {
  customerId: string;
  customerName: string;
  orderCount?: number;
  onetimeRevenue?: number | null;
  subscriptionRevenue?: number | null;
  totalRevenue?: number | null;
  lastOrderDate?: string | null;
  createdAt: Date;
  updatedAt?: Date;
}

interface AllCustomersProps {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
}

export function AllCustomers({ customers: customerStats, onEdit, onDelete }: AllCustomersProps) {
  const { t, formatCurrency, formatDate } = useClientI18n();

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">{t('allCustomers')}</h3>
          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            {customerStats.length}{t('people')}
          </span>
        </div>
      </div>
      <div className="p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="w-[300px] text-left px-1.5 py-2 text-xs font-medium text-gray-500">{t('customerName')}</th>
              {typeof customerStats[0]?.onetimeRevenue !== 'undefined' && (
                <th className="text-center px-1.5 py-2 text-xs font-medium text-gray-500">{t('onetimeRevenue')}</th>
              )}
              {typeof customerStats[0]?.subscriptionRevenue !== 'undefined' && (
                <th className="text-center px-1.5 py-2 text-xs font-medium text-gray-500">{t('subscriptionRevenue')}</th>
              )}
              {typeof customerStats[0]?.totalRevenue !== 'undefined' && (
                <th className="text-center px-1.5 py-2 text-xs font-medium text-gray-500">{t('totalRevenue')}</th>
              )}
              {typeof customerStats[0]?.lastOrderDate !== 'undefined' && (
                <th className="text-center px-1.5 py-2 text-xs font-medium text-gray-500">{t('lastOrder')}</th>
              )}
              <th className="text-center px-1.5 py-2 text-xs font-medium text-gray-500">{t('created')}</th>
              <th className="text-right px-1.5 py-2 text-xs font-medium text-gray-500">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {customerStats.map((customer, index) => (
              <tr key={`customer-${customer.customerId}-${index}`} className="border-b border-slate-100">
                <td className="px-1.5 py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <Building className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <button
                        onClick={() => window.location.href = `/customers/${customer.customerId}`}
                        className="font-medium text-blue-600 text-xs bg-none border-none cursor-pointer underline p-0 hover:text-blue-800"
                      >
                        {customer.customerName}
                      </button>
                      <p className="text-xs text-gray-500 m-0">
                        ID: {customer.customerId.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </td>
                {typeof customer.onetimeRevenue !== 'undefined' && (
                  <td className="px-2 py-3 text-center">
                    <span className="font-medium">
                      {formatCurrency(customer.onetimeRevenue || 0)}
                    </span>
                  </td>
                )}
                {typeof customer.subscriptionRevenue !== 'undefined' && (
                  <td className="px-2 py-3 text-center">
                    <span className="font-medium">
                      {formatCurrency(customer.subscriptionRevenue || 0)}
                    </span>
                  </td>
                )}
                {typeof customer.totalRevenue !== 'undefined' && (
                  <td className="px-2 py-3 text-center">
                    <span className="font-medium">
                      {formatCurrency(customer.totalRevenue || 0)}
                    </span>
                  </td>
                )}
                {typeof customer.lastOrderDate !== 'undefined' && (
                  <td className="px-2 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs">
                        {customer.lastOrderDate
                          ? formatDate(customer.lastOrderDate)
                          : '-'}
                      </span>
                    </div>
                  </td>
                )}
                <td className="px-2 py-3 text-center">
                  <span className="text-xs text-gray-500">
                    {formatDate(customer.createdAt)}
                  </span>
                </td>
                <td className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(customer)}
                        className="flex items-center justify-center w-8 h-8 rounded-md bg-transparent border-none cursor-pointer transition-colors hover:bg-gray-100"
                      >
                        <Edit className="h-3.5 w-3.5 text-gray-500" />
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(customer)}
                        className="flex items-center justify-center w-8 h-8 rounded-md bg-transparent border-none cursor-pointer transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}