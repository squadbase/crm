'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SalesSummary } from './components/SalesSummary';
import { OrdersFilter } from './components/OrdersFilter';
import { PeriodSelector } from './components/PeriodSelector';
import { OrdersTable } from './components/OrdersTable';
import { OrderForm } from './components/OrderForm';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { useClientI18n } from '@/hooks/useClientI18n';

interface Order {
  orderId: string;
  customerId: string;
  customerName: string;
  amount: string;
  salesAt: string | null | undefined;
  isPaid: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FilterValues {
  isPaid: string;
  search: string;
}

interface PeriodValues {
  startDate: string;
  endDate: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function OrdersPage() {
  const { t } = useClientI18n();
  const router = useRouter();
  
  // Set page title
  useEffect(() => {
    document.title = t('ordersTitle');
  }, [t]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({
    isPaid: '',
    search: ''
  });
  
  const [period, setPeriod] = useState<PeriodValues>({
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // Modal state management
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, period, pagination.page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== '')
        ),
        ...Object.fromEntries(
          Object.entries(period).filter(([, value]) => value !== '')
        )
      });

      const response = await fetch(`/api/orders?${params}`);
      const data = await response.json();
      
      setOrders(data.orders || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0
      }));
    } catch {
      // Error handled silently - failed to fetch orders
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePeriodChange = (newPeriod: PeriodValues) => {
    setPeriod(newPeriod);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (order: Order) => {
    setDeletingOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;

    try {
      const response = await fetch(`/api/orders/${deletingOrder.orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchOrders();
      } else {
        // Failed to delete order
      }
    } catch {
      // Delete error - handled silently
    }
  };

  const handlePaymentStatusToggle = async (orderId: string, isPaid: boolean) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-payment-status',
          isPaid,
        }),
      });

      if (response.ok) {
        fetchOrders();
      } else {
        // Failed to update payment status
      }
    } catch {
      // Payment status update error - handled silently
    }
  };

  const handleAddOrder = () => {
    setIsCreateDialogOpen(true);
  };

  const handleView = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleFormSuccess = () => {
    fetchOrders();
  };

  const headerActions = (
    <button
      onClick={handleAddOrder}
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
{t('newOrder')}
    </button>
  );

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'white' 
    }}>
      <PageHeader
        title={t('onetimeOrders')}
        description={t('orderDescription')}
        actions={headerActions}
      />

      <div style={{ padding: '16px' }}>
        <PeriodSelector onPeriodChange={handlePeriodChange} />
        <SalesSummary period={{ salesStartDt: period.startDate, salesEndDt: period.endDate }} />
        <OrdersFilter onFilterChange={handleFilterChange} />
        <OrdersTable
          orders={orders}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPaymentStatusToggle={handlePaymentStatusToggle}
          onView={handleView}
          onCreateNew={handleAddOrder}
        />

        {/* Modals */}
        <OrderForm
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={handleFormSuccess}
        />

        <OrderForm
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingOrder(null);
          }}
          onSuccess={handleFormSuccess}
          editingOrder={editingOrder}
        />

        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeletingOrder(null);
          }}
          onConfirm={handleConfirmDelete}
          orderName={deletingOrder ? `${deletingOrder.customerName} - ${deletingOrder.description || 'Order'}` : ''}
        />

        {/* Pagination */}
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
    </div>
  );
}