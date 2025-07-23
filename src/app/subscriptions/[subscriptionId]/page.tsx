'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, DollarSign, AlertTriangle, Play, User, CreditCard, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useClientI18n } from '@/hooks/useClientI18n';

interface Subscription {
  subscriptionId: string;
  customerId: string;
  customerName: string;
  description: string;
  currentAmount: number;
  totalPaid: number;
  totalUnpaid: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionAmount {
  amountId: string;
  subscriptionId: string;
  amount: number;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionPayment {
  paidId: string;
  subscriptionId: string;
  year: number;
  month: number;
  amount: number;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ subscriptionId: string }>;
}) {
  const router = useRouter();
  const { t, formatCurrency, formatDate } = useClientI18n();
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [amounts, setAmounts] = useState<SubscriptionAmount[]>([]);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [showEditAmountModal, setShowEditAmountModal] = useState(false);
  const [showDeleteAmountModal, setShowDeleteAmountModal] = useState(false);
  const [editingAmount, setEditingAmount] = useState<SubscriptionAmount | null>(null);

  // Form states
  const [newAmount, setNewAmount] = useState('');
  const [newAmountDisplay, setNewAmountDisplay] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [cancelDate, setCancelDate] = useState('');
  const [restartDate, setRestartDate] = useState('');
  const [restartAmountDisplay, setRestartAmountDisplay] = useState('');

  // Edit amount form states
  const [editAmount, setEditAmount] = useState('');
  const [editAmountDisplay, setEditAmountDisplay] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  const fetchSubscriptionDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch subscription basic info, pricing history, and payment history in batch
      const subscriptionResponse = await fetch(`/api/subscriptions/${subscriptionId}`);
      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.json();
        throw new Error(errorData.error || 'Failed to fetch subscription');
      }

      const data = await subscriptionResponse.json();
      // Subscription data received successfully

      setSubscription(data.subscription);
      setAmounts(data.amounts || []);
      setPayments(data.payments || []);

    } catch (err) {
      // Error fetching subscription detail
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [subscriptionId]);

  useEffect(() => {
    params.then((resolvedParams) => {
      setSubscriptionId(resolvedParams.subscriptionId);
    });
  }, [params]);

  useEffect(() => {
    if (subscriptionId) {
      fetchSubscriptionDetail();
    }
  }, [subscriptionId, fetchSubscriptionDetail]);

  // Set page title
  useEffect(() => {
    if (subscription?.customerName) {
      document.title = `${subscription.customerName} - ${t('subscription')} ${t('details')}`;
    } else {
      document.title = `${t('subscription')} ${t('details')}`;
    }
  }, [subscription?.customerName, t]);

  const handleAmountChange = async () => {
    if (!newAmount || !effectiveDate) {
      setError('Please enter amount and effective date');
      return;
    }

    try {
      // Terminate existing amount
      const currentAmount = amounts.find(a => !a.endDate);
      if (currentAmount) {
        await fetch(`/api/subscription-amounts/${currentAmount.amountId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endDate: effectiveDate })
        });
      }

      // Create new amount
      const response = await fetch('/api/subscription-amounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          amount: Number(newAmount),
          startDate: effectiveDate
        })
      });

      if (!response.ok) throw new Error('Failed to update amount');

      setShowAmountModal(false);
      setNewAmount('');
      setNewAmountDisplay('');
      setEffectiveDate('');
      setError(null);
      fetchSubscriptionDetail();
    } catch {
      // Failed to update amount
      setError('Failed to update fee');
    }
  };

  const handleCancelSubscription = async () => {
    if (!cancelDate) {
      setError('Please enter ' + t('cancelDate'));
      return;
    }

    try {
      // Terminate current amount
      const currentAmount = amounts.find(a => !a.endDate);
      if (currentAmount) {
        const response = await fetch(`/api/subscription-amounts/${currentAmount.amountId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endDate: cancelDate })
        });

        if (!response.ok) throw new Error('Failed to cancel subscription');
      }

      setShowCancelModal(false);
      setCancelDate('');
      setError(null);
      fetchSubscriptionDetail();
    } catch {
      // Failed to cancel subscription
      setError('Failed to cancel subscription');
    }
  };

  const handleRestartSubscription = async () => {
    if (!restartDate || !newAmount) {
      setError('Please enter ' + t('restartDate') + ' and amount');
      return;
    }

    try {
      // Create new amount
      const response = await fetch('/api/subscription-amounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          amount: Number(newAmount),
          startDate: restartDate
        })
      });

      if (!response.ok) throw new Error('Failed to restart subscription');

      setShowRestartModal(false);
      setRestartDate('');
      setNewAmount('');
      setRestartAmountDisplay('');
      setError(null);
      fetchSubscriptionDetail();
    } catch {
      // Failed to restart subscription
      setError('Failed to restart subscription');
    }
  };

  const handlePaymentToggle = async (payment: SubscriptionPayment) => {
    try {
      const response = await fetch(`/api/subscription-payments/${payment.paidId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: !payment.isPaid })
      });

      if (!response.ok) throw new Error('Failed to update payment');

      fetchSubscriptionDetail();
    } catch {
      // Failed to update payment
      setError('Failed to update payment status');
    }
  };

  const handleEditAmount = (amount: SubscriptionAmount) => {
    setEditingAmount(amount);
    const amountString = amount.amount.toString();
    setEditAmount(amountString);
    setEditAmountDisplay(formatNumberWithCommas(amountString));
    setEditStartDate(amount.startDate);
    setEditEndDate(amount.endDate || '');
    setShowEditAmountModal(true);
  };

  const handleUpdateAmount = async () => {
    if (!editingAmount || !editAmount || !editStartDate) {
      setError('Amount and start date are required');
      return;
    }

    try {
      const response = await fetch(`/api/subscription-amounts/${editingAmount.amountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(editAmount),
          startDate: editStartDate,
          endDate: editEndDate || null
        })
      });

      if (!response.ok) throw new Error('Failed to update amount');

      setShowEditAmountModal(false);
      setEditingAmount(null);
      setEditAmount('');
      setEditAmountDisplay('');
      setEditStartDate('');
      setEditEndDate('');
      setError(null);
      fetchSubscriptionDetail();
    } catch {
      // Failed to update amount
      setError('Failed to update fee history');
    }
  };

  const handleDeleteAmount = (amount: SubscriptionAmount) => {
    setEditingAmount(amount);
    setShowDeleteAmountModal(true);
  };

  const handleConfirmDeleteAmount = async () => {
    if (!editingAmount) return;

    try {
      const response = await fetch(`/api/subscription-amounts/${editingAmount.amountId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete amount');

      setShowDeleteAmountModal(false);
      setEditingAmount(null);
      setError(null);
      fetchSubscriptionDetail();
    } catch {
      // Failed to delete amount
      setError('Failed to delete fee history');
    }
  };

  const formatAmount = (amount: number) => {
    return formatCurrency(amount);
  };

  // Format numbers with comma separators
  const formatNumberWithCommas = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue).toLocaleString();
  };

  // Get numeric value from comma-separated string
  const getNumericValue = (value: string) => {
    return value.replace(/[^\d]/g, '');
  };

  // Amount input handler
  const handleAmountInputChange = (value: string, setAmount: (v: string) => void, setDisplay: (v: string) => void) => {
    const numericValue = getNumericValue(value);
    setAmount(numericValue);
    setDisplay(formatNumberWithCommas(numericValue));
  };

  const formatYearMonth = (year: number, month: number) => {
    const language = typeof window !== 'undefined' && window.localStorage.getItem('language') || 'en';
    if (language === 'ja') {
      return `${year}年${month}月`;
    } else {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return `${monthNames[month - 1]} ${year}`;
    }
  };

  const handleBack = () => {
    router.push('/subscriptions');
  };

  // Check if currently active (validate with current date)
  const isCurrentlyActive = subscription && amounts.some(a => {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const startDate = a.startDate;
    const endDate = a.endDate;

    // Start date <= current date AND (no end date OR end date >= current date)
    return startDate <= today && (!endDate || endDate >= today);
  });

  const headerActions = (
    <div className="flex items-center gap-3">
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
      >
        <ArrowLeft size={16} />
        {t('back')}
      </button>

      {isCurrentlyActive ? (
        <>
          <button
            onClick={() => setShowAmountModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
          >
            <DollarSign size={16} />
            {t('changeFee')}
          </button>
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-md cursor-pointer hover:bg-red-50"
          >
            <X size={16} />
            {t('cancelSubscription')}
          </button>
        </>
      ) : (
        <button
          onClick={() => setShowRestartModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-600 bg-white border border-emerald-600 rounded-md cursor-pointer hover:bg-emerald-50"
        >
          <Play size={16} />
          {t('restartSubscription')}
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white'
      }}>
        <PageHeader
          title={`${t('subscription')} - ${t('details')}`}
          description={subscription?.customerName ? `${t('customer')}: ${subscription.customerName}` : t('loadingSubscriptionDetails')}
          actions={headerActions}
        />
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontSize: '16px',
          color: '#6b7280'
        }}>
          {t('loading')}
        </div>
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white'
      }}>
        <PageHeader
          title={`${t('subscription')} - ${t('details')}`}
          description={t('errorLoadingSubscription')}
          actions={headerActions}
        />
        <div className="py-10 px-10 text-center">
          <div className="text-sm font-semibold text-red-600 mb-2">
            An error occurred
          </div>
          <div className="text-sm text-gray-500">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex flex-col bg-white">
        <PageHeader
          title={`${t('subscription')} - ${t('details')}`}
          description={t('subscriptionNotFound')}
          actions={headerActions}
        />
        <div className="py-10 px-10 text-center">
          <div className="text-sm font-semibold text-gray-900 mb-2">
            Subscription not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white">
      <PageHeader
        title={`${t('subscription')} - ${t('details')}`}
        description={`${t('subscriptionId')}: ${subscriptionId}`}
        actions={headerActions}
      />

      <div className="p-6">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-5">
            <p className="text-red-600 text-sm m-0">{error}</p>
          </div>
        )}

        {/* Basic information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            {t('basicInformation')}
          </h3>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
            {/* Customer information */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <User size={20} color="#2563eb" />
              <div>
                <p className="text-xs text-gray-500 m-0 mb-1">
                  {t('customer')}
                </p>
                <p className="text-sm font-medium text-blue-600 m-0 cursor-pointer underline hover:text-blue-800"
                  onClick={() => router.push(`/customers/${subscription.customerId}`)}
                >
                  {subscription.customerName}
                </p>
              </div>
            </div>

            {/* Current monthly fee */}
            <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-lg">
              <DollarSign size={20} color="#0284c7" />
              <div>
                <p className="text-xs text-gray-500 m-0 mb-1">
                  {t('currentMonthlyFee')}
                </p>
                <p className="text-sm font-semibold text-slate-900 m-0">
                  {formatAmount(subscription.currentAmount)}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className={`flex items-center gap-3 p-4 rounded-lg ${
              subscription.status === 'active' ? 'bg-green-50' : 'bg-gray-100'
            }`}>
              <CreditCard size={20} color={subscription.status === 'active' ? '#16a34a' : '#6b7280'} />
              <div>
                <p className="text-xs text-gray-500 m-0 mb-1">
                  {t('status')}
                </p>
                <p className={`text-sm font-medium m-0 ${
                  subscription.status === 'active' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {subscription.status === 'active' ? t('active') : t('inactive')}
                </p>
              </div>
            </div>

            {/* Created date */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
              <Clock size={20} color="#d97706" />
              <div>
                <p className="text-xs text-gray-500 m-0 mb-1">
                  {t('created')}
                </p>
                <p className="text-sm font-medium text-slate-900 m-0">
                  {formatDate(subscription.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {subscription.description && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              {t('description')}
            </h3>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#374151',
                margin: 0,
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {subscription.description}
              </p>
            </div>
          </div>
        )}

        {/* Price history */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '16px',
            margin: 0
          }}>
            {t('priceHistory')}
          </h2>

          {amounts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              {t('noFeeHistory')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {t('amount')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {t('startDate')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {t('endDate')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {t('status')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {amounts.map((amount, index) => (
                    <tr
                      key={`amount-${amount.amountId}-${index}`}
                      style={{
                        borderBottom: '1px solid #e5e7eb'
                      }}
                    >
                      <td style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#111827'
                      }}>
                        {formatAmount(amount.amount)}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: '#111827'
                      }}>
                        {amount.startDate}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: '#111827'
                      }}>
                        {amount.endDate || t('ongoing')}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: '500',
                          borderRadius: '12px',
                          backgroundColor: amount.endDate ? '#fef2f2' : '#dcfce7',
                          color: amount.endDate ? '#dc2626' : '#166534'
                        }}>
                          {amount.endDate ? t('ended') : t('active')}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'center'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleEditAmount(amount)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              fontWeight: '500',
                              color: '#2563eb',
                              backgroundColor: 'white',
                              border: '1px solid #2563eb',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#eff6ff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
                          >
                            {t('edit')}
                          </button>
                          <button
                            onClick={() => handleDeleteAmount(amount)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              fontWeight: '500',
                              color: '#dc2626',
                              backgroundColor: 'white',
                              border: '1px solid #dc2626',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
                          >
                            {t('delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment history */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '16px',
            margin: 0
          }}>
            {t('paymentHistory')}
          </h2>

          {payments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              {t('noPaymentHistory')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {t('yearMonth')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {t('amount')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {t('paymentStatus')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr
                      key={`payment-${payment.paidId}-${index}`}
                      style={{
                        borderBottom: '1px solid #e5e7eb'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: '#111827'
                      }}>
                        {formatYearMonth(payment.year, payment.month)}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#111827'
                      }}>
                        {formatAmount(payment.amount)}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: '500',
                          borderRadius: '12px',
                          backgroundColor: payment.isPaid ? '#dcfce7' : '#fef2f2',
                          color: payment.isPaid ? '#166534' : '#dc2626'
                        }}>
                          {payment.isPaid ? t('paid') : t('unpaid')}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'center'
                      }}>
                        <button
                          onClick={() => handlePaymentToggle(payment)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: payment.isPaid ? '#dc2626' : '#059669',
                            backgroundColor: 'white',
                            border: `1px solid ${payment.isPaid ? '#fecaca' : '#bbf7d0'}`,
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {payment.isPaid ? t('markUnpaid') : t('markPaid')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Payment statistics */}
          {payments.length > 0 && (
            <div style={{
              marginTop: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#dcfce7',
                borderRadius: '8px',
                border: '1px solid #bbf7d0'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#166534',
                  marginBottom: '4px'
                }}>
                  {t('totalPaid')}
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#166534'
                }}>
                  {formatAmount(payments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0))}
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#dc2626',
                  marginBottom: '4px'
                }}>
                  {t('totalUnpaid')}
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#dc2626'
                }}>
                  {formatAmount(payments.filter(p => !p.isPaid).reduce((sum, p) => sum + p.amount, 0))}
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                border: '1px solid #bfdbfe'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1e40af',
                  marginBottom: '4px'
                }}>
                  {t('totalRevenue')}
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#1e40af'
                }}>
                  {formatAmount(payments.reduce((sum, p) => sum + p.amount, 0))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Amount change modal */}
      {showAmountModal && (
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
            width: '100%',
            maxWidth: '500px',
            margin: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>{t('changeFee')}</h3>

            {/* Current amount display */}
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                {t('currentMonthlyFee')}
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#111827'
              }}>
                {formatAmount(subscription?.currentAmount || 0)}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('newMonthlyFee')}
              </label>
              <input
                type="text"
                value={newAmountDisplay}
                onChange={(e) => handleAmountInputChange(e.target.value, setNewAmount, setNewAmountDisplay)}
                placeholder="50,000"
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
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('effectiveDate')}
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowAmountModal(false);
                  setNewAmount('');
                  setNewAmountDisplay('');
                  setEffectiveDate('');
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleAmountChange}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {t('change')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {showCancelModal && (
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
            width: '100%',
            maxWidth: '500px',
            margin: '16px',
            position: 'relative'
          }}>
            {/* Top right X button */}
            <button
              onClick={() => {
                setShowCancelModal(false);
                setCancelDate('');
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '15px',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ×
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={24} color="#dc2626" />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626', margin: 0 }}>
                {t('cancelModal')}
              </h3>
            </div>

            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              {t('cancelWarning')}
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('cancelDate')}
              </label>
              <input
                type="date"
                value={cancelDate}
                onChange={(e) => setCancelDate(e.target.value)}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={handleCancelSubscription}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#dc2626',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {t('confirmCancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restart modal */}
      {showRestartModal && (
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
            width: '100%',
            maxWidth: '500px',
            margin: '16px',
            position: 'relative'
          }}>
            {/* Top right X button */}
            <button
              onClick={() => {
                setShowRestartModal(false);
                setRestartDate('');
                setNewAmount('');
                setRestartAmountDisplay('');
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '15px',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ×
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Play size={24} color="#059669" />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#059669', margin: 0 }}>
                {t('restartModal')}
              </h3>
            </div>

            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              {t('restartWarning')}
            </p>

            {/* Last amount display */}
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f0fdf4',
              borderRadius: '6px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#166534',
                marginBottom: '4px'
              }}>
                {t('lastMonthlyFee')}
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#111827'
              }}>
                {amounts && amounts.length > 0 ? formatAmount(amounts[0].amount) : '¥0'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('newMonthlyFee')}
              </label>
              <input
                type="text"
                value={restartAmountDisplay}
                onChange={(e) => handleAmountInputChange(e.target.value, setNewAmount, setRestartAmountDisplay)}
                placeholder="50,000"
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
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('restartDate')}
              </label>
              <input
                type="date"
                value={restartDate}
                onChange={(e) => setRestartDate(e.target.value)}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={handleRestartSubscription}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#059669',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {t('confirmRestart')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price history edit modal */}
      {showEditAmountModal && editingAmount && (
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
            width: '100%',
            maxWidth: '500px',
            margin: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              {t('edit')} {t('priceHistory')}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('amount')}
              </label>
              <input
                type="text"
                value={editAmountDisplay}
                onChange={(e) => handleAmountInputChange(e.target.value, setEditAmount, setEditAmountDisplay)}
                placeholder="120,000"
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('startDate')}
              </label>
              <input
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
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
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('endDate')} ({t('optional')})
              </label>
              <input
                type="date"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowEditAmountModal(false);
                  setEditingAmount(null);
                  setEditAmount('');
                  setEditAmountDisplay('');
                  setEditStartDate('');
                  setEditEndDate('');
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleUpdateAmount}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {t('update')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price history deletion confirmation modal */}
      {showDeleteAmountModal && editingAmount && (
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
            width: '100%',
            maxWidth: '400px',
            margin: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={24} color="#dc2626" />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626', margin: 0 }}>
                {t('delete')} {t('priceHistory')}
              </h3>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                {t('deletingRecord')}:
              </div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                {formatAmount(editingAmount.amount)} ({editingAmount.startDate} - {editingAmount.endDate || t('ongoing')})
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
              {t('deleteWarning')} {t('thisActionCannotBeUndone')}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowDeleteAmountModal(false);
                  setEditingAmount(null);
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleConfirmDeleteAmount}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#dc2626',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}