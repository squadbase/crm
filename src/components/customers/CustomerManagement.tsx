'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AllCustomers } from './AllCustomers';
import { CustomerForm } from './CustomerForm';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { SearchInput } from './SearchInput';
import { Pagination } from './Pagination';
import { useClientI18n } from '@/hooks/useClientI18n';

interface Customer {
  customerId: string;
  customerName: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function CustomerManagement() {
  const { t } = useClientI18n();
  
  // ページタイトル設定
  useEffect(() => {
    document.title = t('customersTitle');
  }, [t]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Fetch customers
  const fetchCustomers = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search })
      });

      const response = await fetch(`/api/customers?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data.customers);
      setPagination(data.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCustomers(1, searchTerm);
  }, [fetchCustomers, searchTerm]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchCustomers(page, searchTerm);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // fetchCustomers will be called by useEffect when searchTerm changes
  };

  // Handle create customer
  const handleCreateCustomer = (customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
    // Refresh to get accurate pagination
    fetchCustomers(pagination.currentPage, searchTerm);
  };

  // Handle edit customer
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => 
      prev.map(c => c.customerId === updatedCustomer.customerId ? updatedCustomer : c)
    );
    setEditingCustomer(null);
  };

  // Handle delete customer
  const handleDeleteCustomer = (customer: Customer) => {
    setDeletingCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCustomer) return;

    try {
      const response = await fetch(`/api/customers/${deletingCustomer.customerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete customer');
      }

      setCustomers(prev => 
        prev.filter(c => c.customerId !== deletingCustomer.customerId)
      );
      
      // Refresh to get accurate pagination
      fetchCustomers(pagination.currentPage, searchTerm);
      
      setDeletingCustomer(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete customer');
    }
  };

  const headerActions = (
    <button 
      onClick={() => setIsCreateDialogOpen(true)}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
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
      <UserPlus style={{ height: '14px', width: '14px', marginRight: '6px' }} />
      {t('addCustomer')}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PageHeader
        title={t('customers')}
        description={t('customerManagement')}
        actions={headerActions}
      />
      
      {/* Main Content */}
      <div style={{ flex: 1, padding: '16px', backgroundColor: 'white' }}>
        {/* Search and Filters */}
        <div style={{ marginBottom: '12px' }}>
          <SearchInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search customers..."
          />
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '10px',
            backgroundColor: '#fef2f2',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#dc2626',
              margin: 0
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0f172a', marginBottom: '6px' }}>
              No customers found
            </p>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first customer.'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setIsCreateDialogOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
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
                <UserPlus style={{ height: '14px', width: '14px', marginRight: '6px' }} />
                Add Customer
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Customer Table */}
            <AllCustomers 
              customers={customers} 
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
            />
            
            {/* Pagination */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <CustomerForm
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateCustomer}
      />

      <CustomerForm
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingCustomer(null);
        }}
        onSuccess={handleUpdateCustomer}
        editingCustomer={editingCustomer}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingCustomer(null);
        }}
        onConfirm={handleConfirmDelete}
        customerName={deletingCustomer?.customerName || ''}
      />
    </div>
  );
}