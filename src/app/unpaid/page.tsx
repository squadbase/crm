'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useClientI18n } from '@/hooks/useClientI18n';
import { Receipt, Check, AlertCircle, Calculator, RefreshCw, Info } from 'lucide-react';
import {
  isCalculationExecuting,
  getLastExecutionTime,
  getRemainingCooldownMinutes
} from '@/lib/calculation-cooldown';

interface UnpaidPayment {
  id: string;
  type: 'onetime' | 'subscription';
  customerName: string;
  amount: string;
  description: string;
  salesDate: string;
  dueDate: string;
  isPaid: boolean;
  serviceType: string;
  paymentType: string;
  createdAt: string;
  subscriptionId?: string;
  year?: number;
  month?: number;
}

interface UnpaidPaymentsResponse {
  unpaidPayments: UnpaidPayment[];
  totalCount: number;
  totalAmount: number;
  currentMonthStart: string;
}

export default function UnpaidPaymentsPage() {
  const { t, formatCurrency } = useClientI18n();

  // Set page title
  useEffect(() => {
    document.title = t('unpaidPaymentsTitle');
  }, [t]);

  const [unpaidPayments, setUnpaidPayments] = useState<UnpaidPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [calculationYear, setCalculationYear] = useState(new Date().getFullYear());
  const [calculationMonth, setCalculationMonth] = useState(new Date().getMonth() + 1);
  const [calculating, setCalculating] = useState(false);
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [isSyncInProgress, setIsSyncInProgress] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [remainingCooldown, setRemainingCooldown] = useState(0);

  // Get current year and month
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Check if selected year/month is in the future
  const isSelectedDateInFuture = isRangeMode
    ? endYear > currentYear || (endYear === currentYear && endMonth > currentMonth)
    : calculationYear > currentYear || (calculationYear === currentYear && calculationMonth > currentMonth);

  // Function to get month name
  const getMonthName = (monthNumber: number): string => {
    const monthKeys: Array<'january' | 'february' | 'march' | 'april' | 'may' | 'june' | 
                          'july' | 'august' | 'september' | 'october' | 'november' | 'december'> = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    return t(monthKeys[monthNumber - 1]);
  };

  // Fetch unpaid transactions
  const fetchUnpaidPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/unpaid');
      const data: UnpaidPaymentsResponse = await response.json();

      setUnpaidPayments(data.unpaidPayments);
      setTotalAmount(data.totalAmount);
    } catch {
      // Error handled silently - failed to fetch unpaid payments
    } finally {
      setLoading(false);
    }
  };

  // Function to update sync status
  const updateSyncStatus = () => {
    setIsSyncInProgress(isCalculationExecuting());
    setLastSyncTime(getLastExecutionTime());
    setRemainingCooldown(getRemainingCooldownMinutes());
  };

  // Initial data fetch
  useEffect(() => {
    fetchUnpaidPayments();
    updateSyncStatus();
  }, []);

  // Update sync status every 5 seconds
  useEffect(() => {
    const interval = setInterval(updateSyncStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Toggle individual selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Toggle select all / deselect all
  const toggleSelectAll = () => {
    if (!unpaidPayments) return;

    if (selectedItems.size === unpaidPayments.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(unpaidPayments.map(p => p.id)));
    }
  };

  // Calculate monthly payments
  const calculateMonthlyPayments = async () => {
    setCalculating(true);
    try {
      const requestBody = isRangeMode
        ? {
            startYear: calculationYear,
            startMonth: calculationMonth,
            endYear: endYear,
            endMonth: endMonth
          }
        : {
            year: calculationYear,
            month: calculationMonth
          };

      const response = await fetch('/api/subscriptions/calculate-monthly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // On successful calculation: refetch unpaid list
        await fetchUnpaidPayments();
        setShowCalculationModal(false);
        // Monthly calculation completed successfully
      } else {
        // Monthly calculation failed
        alert(`${t('calculationFailed')}: ${result.error || t('unknownError')}`);
      }
    } catch (error) {
      // Failed to calculate monthly payments
      alert(`${t('apiCallFailed')}: ${error instanceof Error ? error.message : t('unknownError')}`)
    } finally {
      setCalculating(false);
    }
  };

  // Mark as paid
  const markAsPaid = async () => {
    if (selectedItems.size === 0) return;

    setUpdating(true);
    try {
      const items = Array.from(selectedItems).map(id => {
        const payment = unpaidPayments.find(p => p.id === id);
        if (!payment) return null;

        return {
          id: payment.id,
          type: payment.type,
          subscriptionId: payment.subscriptionId,
          year: payment.year,
          month: payment.month
        };
      }).filter(item => item !== null);

      const response = await fetch('/api/unpaid/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const result = await response.json();

      if (result.success) {
        // On success: refetch data and clear selection
        await fetchUnpaidPayments();
        setSelectedItems(new Set());
        // Silent update (alert removed)
      } else {
        // Payment update failed - handled silently
      }
    } catch {
      // Failed to update payment status - handled silently
      // Error also handled silently (alert removed)
    } finally {
      setUpdating(false);
    }
  };

  // Calculate days past due
  const getDaysPastDue = (dueDateStr: string) => {
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Date format - yyyy/MM/dd format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const headerActions = (
    <div className="flex gap-3 items-center">
      {selectedItems.size > 0 && (
        <span className="text-sm text-gray-500 font-medium">
          {selectedItems.size} {t('selectedItemsCount')}
        </span>
      )}

      <button
        onClick={() => setShowCalculationModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
      >
        <Calculator size={16} />
        {t('calculateMonthly')}
      </button>

      <button
        onClick={toggleSelectAll}
        disabled={!unpaidPayments || unpaidPayments.length === 0}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md ${
          !unpaidPayments || unpaidPayments.length === 0 
            ? 'cursor-not-allowed opacity-50' 
            : 'hover:bg-gray-50 cursor-pointer'
        }`}
      >
        {unpaidPayments && selectedItems.size === unpaidPayments.length ? t('clearSelection') : t('selectAll')}
      </button>

      <button
        onClick={markAsPaid}
        disabled={selectedItems.size === 0 || updating}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-md border-0 ${
          selectedItems.size === 0 || updating 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
        }`}
      >
        <Check size={16} />
        {updating ? t('updating') : t('markSelectedAsPaid')}
      </button>
    </div>
  );

  return (
    <>
      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* Monthly calculation modal */}
      {showCalculationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw] shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('calculateMonthlyPayments')}
            </h3>

            {/* Range mode toggle */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isRangeMode}
                  onChange={(e) => setIsRangeMode(e.target.checked)}
                  className="cursor-pointer"
                />
                {t('dateRange')}
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRangeMode ? t('startYear') : t('year')}
              </label>
              <input
                type="number"
                value={calculationYear}
                onChange={(e) => {
                  const newYear = parseInt(e.target.value);
                  setCalculationYear(newYear);
                  // If year selected is in the future, reset to current month
                  if (newYear > currentYear || (newYear === currentYear && calculationMonth > currentMonth)) {
                    setCalculationMonth(newYear === currentYear ? currentMonth : 12);
                  }
                }}
                min="2020"
                max={currentYear}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div className={isRangeMode ? 'mb-4' : 'mb-6'}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRangeMode ? t('startMonth') : t('month')}
              </label>
              <select
                value={calculationMonth}
                onChange={(e) => setCalculationMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {Array.from({ length: calculationYear === currentYear ? currentMonth : 12 }, (_, i) => (
                  <option key={`month-${calculationYear}-${i + 1}`} value={i + 1}>
                    {getMonthName(i + 1)}
                  </option>
                ))}
              </select>
            </div>

            {/* End date inputs (only shown in range mode) */}
            {isRangeMode && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('endYear')}
                  </label>
                  <input
                    type="number"
                    value={endYear}
                    onChange={(e) => {
                      const newEndYear = parseInt(e.target.value);
                      setEndYear(newEndYear);
                      // If end year is less than start year, adjust start year
                      if (newEndYear < calculationYear) {
                        setCalculationYear(newEndYear);
                      }
                      // If end year is current year and end month > current month, adjust
                      if (newEndYear === currentYear && endMonth > currentMonth) {
                        setEndMonth(currentMonth);
                      }
                    }}
                    min="2020"
                    max={currentYear}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('endMonth')}
                  </label>
                  <select
                    value={endMonth}
                    onChange={(e) => setEndMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {Array.from({ length: endYear === currentYear ? currentMonth : 12 }, (_, i) => (
                      <option key={`end-month-${endYear}-${i + 1}`} value={i + 1}>
                        {getMonthName(i + 1)}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {isSelectedDateInFuture && (
              <div className="p-3 mb-4 bg-amber-100 border border-amber-500 rounded-md text-sm text-amber-800">
                {isRangeMode
                  ? t('futureMonthWarningRange')
                      .replace('{currentYear}', currentYear.toString())
                      .replace('{currentMonth}', currentMonth.toString())
                  : t('futureMonthWarning')
                      .replace('{currentYear}', currentYear.toString())
                      .replace('{currentMonth}', currentMonth.toString())}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCalculationModal(false)}
                disabled={calculating}
                className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md ${
                  calculating ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 cursor-pointer'
                }`}
              >
                {t('cancel')}
              </button>
              <button
                onClick={calculateMonthlyPayments}
                disabled={calculating || isSelectedDateInFuture}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white border-0 rounded-md ${
                  calculating || isSelectedDateInFuture 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                }`}
              >
                <Calculator size={16} />
                {calculating ? t('calculating') : (isRangeMode ? t('calculateRange') : t('calculate'))}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white">
      <PageHeader
        title={t('unpaidPayments')}
        description={t('unpaidPaymentsDescription')}
        actions={headerActions}
      />

      {/* Sync status indicator */}
      <div className={`mx-6 mb-4 rounded-lg p-3 ${
        isSyncInProgress 
          ? 'bg-amber-100 border border-amber-500' 
          : 'bg-sky-50 border border-sky-500'
      }`}>
        <div className="flex items-center gap-3 text-sm">
          {isSyncInProgress ? (
            <>
              <RefreshCw
                size={16}
                className="text-amber-500 animate-spin"
              />
              <span className="text-amber-800 font-medium">
                {t('syncInProgress')}
              </span>
            </>
          ) : (
            <>
              <Check size={16} className="text-sky-500" />
              <div className="text-sky-800">
                <span className="font-medium">{t('syncCompleted')}</span>
                {lastSyncTime && (
                  <span className="ml-2 text-xs opacity-80">
                    {t('lastExecution')}: {lastSyncTime.toLocaleString()}
                  </span>
                )}
              </div>
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Info size={14} className="text-gray-500" />
            <span className="text-xs text-gray-500">
              {t('manualExecutionInfo')}
              {remainingCooldown > 0 && ` (${remainingCooldown}${t('minutesLater')})`}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary card */}
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Receipt size={20} className="text-red-500" />
              <span className="text-sm font-medium text-gray-500">
                {t('totalUnpaid')}
              </span>
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {formatCurrency(totalAmount)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {unpaidPayments ? unpaidPayments.length : 0} items
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              {t('loadingUnpaidPayments')}
            </div>
          ) : !unpaidPayments || unpaidPayments.length === 0 ? (
            <div className="p-12 text-center">
              <Check size={48} className="text-emerald-500 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {t('noUnpaidPayments')}
              </h3>
              <p className="text-sm text-gray-500">
                {t('noUnpaidPaymentsDescription')}
              </p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-slate-200 w-10">
                      <input
                        type="checkbox"
                        checked={unpaidPayments && unpaidPayments.length > 0 && selectedItems.size === unpaidPayments.length}
                        onChange={toggleSelectAll}
                        className="cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-slate-200">
                      {t('transactionType')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-slate-200">
                      {t('customerName')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-slate-200">
                      {t('description')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b border-slate-200">
                      {t('amount')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-slate-200">
                      {t('dueDate')}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-b border-slate-200">
                      {t('daysPastDue')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidPayments && unpaidPayments.map((payment, index) => {
                    const daysPastDue = getDaysPastDue(payment.dueDate);
                    const isSelected = selectedItems.has(payment.id);

                    return (
                      <tr
                        key={`unpaid-${payment.id}-${index}`}
                        className={`border-b border-slate-100 ${
                          isSelected ? 'bg-sky-50' : 'bg-white'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(payment.id)}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                            payment.type === 'onetime' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {payment.type === 'onetime' ? t('onetime') : t('subscription')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {payment.customerName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {payment.description || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                          {formatCurrency(Number(payment.amount))}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(payment.dueDate)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {daysPastDue > 0 && (
                              <AlertCircle size={16} className="text-red-500" />
                            )}
                            <span className={`text-sm font-semibold ${
                              daysPastDue > 0 ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              {daysPastDue} days
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}