'use client';

import { Eye, Plus } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface Subscription {
  subscriptionId: string;
  customerId: string;
  customerName: string;
  description: string;
  currentAmount: number;
  latestAmount: number;
  startDate: string | null;
  endDate: string | null;
  totalPaid: number;
  totalUnpaid: number;
  totalAmount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  loading: boolean;
  onView: (subscriptionId: string) => void;
  onCreateNew: () => void;
}

export function SubscriptionsTable({
  subscriptions,
  loading,
  onView,
  onCreateNew
}: SubscriptionsTableProps) {
  const { t, formatCurrency, formatDate } = useClientI18n();

  const formatAmount = (amount: number) => {
    return formatCurrency(amount);
  };

  const formatDateLocal = (dateString: string) => {
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center">
        <div className="text-base text-gray-500">
          {t('loadingSubscriptions')}
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
        <div className="text-sm font-semibold text-gray-900 mb-2">
          {t('noSubscriptionsFound')}
        </div>
        <div className="text-sm text-gray-500 mb-5">
          {t('noSubscriptionsDescription')}
        </div>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 border-0 rounded-md cursor-pointer hover:bg-blue-700"
        >
          <Plus size={16} />
          {t('createFirstSubscription')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                {t('customerNameHeader')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                {t('serviceContent')}
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200 relative">
                <div
                  className="inline-flex items-center gap-1"
                  title={t('currentAndLatestFeeTooltip')}
                >
                  {t('currentAndLatestFee')}
                </div>
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                {t('totalPaid')}
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                {t('totalUnpaid')}
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                {t('totalFee')}
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                {t('paymentStartDate')}
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                {t('paymentEndDate')}
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription, index) => (
              <tr
                key={`subscription-${index}`}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-sm text-gray-900">
                  {subscription.customerName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {subscription.description || '-'}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  <div className="flex flex-col items-end gap-0.5">
                    <div className={`text-sm font-medium ${subscription.currentAmount > 0 ? 'text-gray-900' : 'text-gray-500'}`}
                    title={t('currentFeeTooltip')}>
                      {formatAmount(subscription.currentAmount)}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-0.5"
                    title={t('latestFeeTooltip')}>
                      <span className="text-[10px]">{t('latestLabel')}</span>
                      {formatAmount(subscription.latestAmount)}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-sm text-emerald-600">
                  {formatAmount(subscription.totalPaid)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-red-600">
                  {formatAmount(subscription.totalUnpaid)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {formatAmount(subscription.totalAmount)}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-500">
                  {subscription.startDate ? formatDateLocal(subscription.startDate) : '-'}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-500">
                  {subscription.endDate ? formatDateLocal(subscription.endDate) : t('continuing')}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onView(subscription.subscriptionId)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-700 bg-transparent border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
                  >
                    <Eye size={12} />
                    {t('viewDetails')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}