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
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {selectedItems.size > 0 && (
        <span style={{
          fontSize: '14px',
          color: '#6b7280',
          fontWeight: '500'
        }}>
          {selectedItems.size} {t('selectedItemsCount')}
        </span>
      )}

      <button
        onClick={() => setShowCalculationModal(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        <Calculator size={16} />
        {t('calculateMonthly')}
      </button>

      <button
        onClick={toggleSelectAll}
        disabled={!unpaidPayments || unpaidPayments.length === 0}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: (!unpaidPayments || unpaidPayments.length === 0) ? 'not-allowed' : 'pointer',
          opacity: (!unpaidPayments || unpaidPayments.length === 0) ? 0.5 : 1
        }}
      >
        {unpaidPayments && selectedItems.size === unpaidPayments.length ? t('clearSelection') : t('selectAll')}
      </button>

      <button
        onClick={markAsPaid}
        disabled={selectedItems.size === 0 || updating}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          fontSize: '14px',
          fontWeight: '500',
          color: 'white',
          backgroundColor: selectedItems.size === 0 || updating ? '#9ca3af' : '#059669',
          border: 'none',
          borderRadius: '6px',
          cursor: selectedItems.size === 0 || updating ? 'not-allowed' : 'pointer'
        }}
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            maxWidth: '90vw',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
              {t('calculateMonthlyPayments')}
            </h3>

            {/* Range mode toggle */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={isRangeMode}
                  onChange={(e) => setIsRangeMode(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                {t('dateRange')}
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
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
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: isRangeMode ? '16px' : '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                {isRangeMode ? t('startMonth') : t('month')}
              </label>
              <select
                value={calculationMonth}
                onChange={(e) => setCalculationMonth(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                {Array.from({ length: calculationYear === currentYear ? currentMonth : 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {getMonthName(i + 1)}
                  </option>
                ))}
              </select>
            </div>

            {/* End date inputs (only shown in range mode) */}
            {isRangeMode && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
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
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    {t('endMonth')}
                  </label>
                  <select
                    value={endMonth}
                    onChange={(e) => setEndMonth(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    {Array.from({ length: endYear === currentYear ? currentMonth : 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {getMonthName(i + 1)}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {isSelectedDateInFuture && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#92400e'
              }}>
{isRangeMode
                  ? t('futureMonthWarningRange')
                      .replace('{currentYear}', currentYear.toString())
                      .replace('{currentMonth}', currentMonth.toString())
                  : t('futureMonthWarning')
                      .replace('{currentYear}', currentYear.toString())
                      .replace('{currentMonth}', currentMonth.toString())}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCalculationModal(false)}
                disabled={calculating}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: calculating ? 'not-allowed' : 'pointer',
                  opacity: calculating ? 0.5 : 1
                }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={calculateMonthlyPayments}
                disabled={calculating || isSelectedDateInFuture}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: (calculating || isSelectedDateInFuture) ? '#9ca3af' : '#2563eb',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (calculating || isSelectedDateInFuture) ? 'not-allowed' : 'pointer'
                }}
              >
                <Calculator size={16} />
                {calculating ? t('calculating') : (isRangeMode ? t('calculateRange') : t('calculate'))}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <PageHeader
        title={t('unpaidPayments')}
        description={t('unpaidPaymentsDescription')}
        actions={headerActions}
      />

      {/* Sync status indicator */}
      <div style={{
        margin: '0 24px 16px 24px',
        backgroundColor: isSyncInProgress ? '#fef3c7' : '#f0f9ff',
        border: `1px solid ${isSyncInProgress ? '#f59e0b' : '#0ea5e9'}`,
        borderRadius: '8px',
        padding: '12px 16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px'
        }}>
          {isSyncInProgress ? (
            <>
              <RefreshCw
                size={16}
                style={{
                  color: '#f59e0b',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <span style={{ color: '#92400e', fontWeight: '500' }}>
                {t('syncInProgress')}
              </span>
            </>
          ) : (
            <>
              <Check size={16} style={{ color: '#0ea5e9' }} />
              <div style={{ color: '#075985' }}>
                <span style={{ fontWeight: '500' }}>{t('syncCompleted')}</span>
                {lastSyncTime && (
                  <span style={{ marginLeft: '8px', fontSize: '13px', opacity: 0.8 }}>
                    {t('lastExecution')}: {lastSyncTime.toLocaleString()}
                  </span>
                )}
              </div>
            </>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={14} style={{ color: '#6b7280' }} />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {t('manualExecutionInfo')}
              {remainingCooldown > 0 && ` (${remainingCooldown}${t('minutesLater')})`}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Summary card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Receipt size={20} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                {t('totalUnpaid')}
              </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
              {formatCurrency(totalAmount)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              {unpaidPayments ? unpaidPayments.length : 0} items
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          {loading ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              {t('loadingUnpaidPayments')}
            </div>
          ) : !unpaidPayments || unpaidPayments.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center'
            }}>
              <Check size={48} style={{ color: '#10b981', margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                {t('noUnpaidPayments')}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                {t('noUnpaidPaymentsDescription')}
              </p>
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                      width: '40px'
                    }}>
                      <input
                        type="checkbox"
                        checked={unpaidPayments && unpaidPayments.length > 0 && selectedItems.size === unpaidPayments.length}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {t('transactionType')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {t('customerName')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {t('description')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {t('amount')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {t('dueDate')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {t('daysPastDue')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidPayments && unpaidPayments.map((payment) => {
                    const daysPastDue = getDaysPastDue(payment.dueDate);
                    const isSelected = selectedItems.has(payment.id);

                    return (
                      <tr
                        key={payment.id}
                        style={{
                          backgroundColor: isSelected ? '#f0f9ff' : 'white',
                          borderBottom: '1px solid #f1f5f9'
                        }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(payment.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '12px',
                            backgroundColor: payment.type === 'onetime' ? '#fef3c7' : '#e0e7ff',
                            color: payment.type === 'onetime' ? '#92400e' : '#3730a3'
                          }}>
                            {payment.type === 'onetime' ? t('onetime') : t('subscription')}
                          </span>
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#111827'
                        }}>
                          {payment.customerName}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          color: '#6b7280',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {payment.description || '-'}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#111827',
                          textAlign: 'right'
                        }}>
                          {formatCurrency(Number(payment.amount))}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          {formatDate(payment.dueDate)}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}>
                            {daysPastDue > 0 && (
                              <AlertCircle size={16} style={{ color: '#ef4444' }} />
                            )}
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: daysPastDue > 0 ? '#ef4444' : '#6b7280'
                            }}>
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