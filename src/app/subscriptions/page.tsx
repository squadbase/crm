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
  startDate: string | null;
  endDate: string | null;
  totalPaid: number;
  totalUnpaid: number;
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
  
  // ページタイトル設定
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
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        fontSize: '13px',
        fontWeight: '500',
        color: 'white',
        backgroundColor: '#2563eb',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
      }}
    >
      <Plus size={16} />
      {t('newSubscriptionButton')}
    </button>
  );

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'white' 
    }}>
      <PageHeader
        title={t('subscriptions')}
        description={t('subscriptionsDescription')}
        actions={headerActions}
      />

      <div style={{ padding: '16px' }}>
        <SubscriptionsSummary />
        <SubscriptionsFilter onFilterChange={handleFilterChange} />
        <SubscriptionsTable
          subscriptions={subscriptions}
          loading={loading}
          onView={handleView}
          onCreateNew={handleAddSubscription}
        />

        {/* ページネーション */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '20px'
          }}>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                opacity: pagination.page === 1 ? 0.5 : 1
              }}
            >
              {t('previous')}
            </button>
            
            <span style={{
              padding: '8px 16px',
              fontSize: '14px',
              color: '#374151'
            }}>
              {pagination.page} / {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                opacity: pagination.page === pagination.totalPages ? 0.5 : 1
              }}
            >
              {t('next')}
            </button>
          </div>
        )}
      </div>

      {/* サブスクリプション作成フォーム */}
      <SubscriptionForm
        isOpen={showSubscriptionForm}
        onClose={() => setShowSubscriptionForm(false)}
        onSuccess={handleSubscriptionFormSuccess}
      />
    </div>
  );
}