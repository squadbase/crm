'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SubscriptionsSummary } from './components/SubscriptionsSummary';
import { SubscriptionsFilter } from './components/SubscriptionsFilter';
import { SubscriptionsTable } from './components/SubscriptionsTable';
import { SubscriptionForm } from './components/SubscriptionForm';
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

interface FilterValues {
  search: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SubscriptionsPage() {
  const { t } = useClientI18n();
  const router = useRouter();

  // Set page title
  useEffect(() => {
    document.title = t('subscriptionsTitle');
  }, [t]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    search: ''
  });

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== '')
        )
      });

      const response = await fetch(`/api/subscriptions?${params}`);
      const data = await response.json();

      setSubscriptions(data.subscriptions || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0
      }));
    } catch {
      // Error handled silently - failed to fetch subscriptions
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleView = (subscriptionId: string) => {
    router.push(`/subscriptions/${subscriptionId}`);
  };

  const handleAddSubscription = () => {
    setShowSubscriptionForm(true);
  };

  const handleSubscriptionFormSuccess = () => {
    fetchSubscriptions();
  };

  const headerActions = (
    <button
      onClick={handleAddSubscription}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border-0 rounded-md cursor-pointer hover:bg-blue-700"
    >
      <Plus size={16} />
      {t('newSubscriptionButton')}
    </button>
  );

  return (
    <div className="flex flex-col bg-white">
      <PageHeader
        title={t('subscriptions')}
        description={t('subscriptionsDescription')}
        actions={headerActions}
      />

      <div className="p-4">
        <SubscriptionsSummary />
        <SubscriptionsFilter onFilterChange={handleFilterChange} />
        <SubscriptionsTable
          subscriptions={subscriptions}
          loading={loading}
          onView={handleView}
          onCreateNew={handleAddSubscription}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-5">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className={`px-3 py-2 border border-gray-300 rounded-md bg-white ${
                pagination.page === 1 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-gray-50'
              }`}
            >
              {t('previous')}
            </button>

            <span className="px-4 py-2 text-sm text-gray-700">
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className={`px-3 py-2 border border-gray-300 rounded-md bg-white ${
                pagination.page === pagination.totalPages 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-gray-50'
              }`}
            >
              {t('next')}
            </button>
          </div>
        )}
      </div>

      {/* Subscription Creation Form */}
      <SubscriptionForm
        isOpen={showSubscriptionForm}
        onClose={() => setShowSubscriptionForm(false)}
        onSuccess={handleSubscriptionFormSuccess}
      />
    </div>
  );
}