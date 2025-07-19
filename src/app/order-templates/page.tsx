'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TemplateTable } from './components/TemplateTable';
import { TemplateModal } from './components/TemplateModal';
import { TemplateDetailModal } from './components/TemplateDetailModal';
import { CreateOrderModal } from './components/CreateOrderModal';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { useClientI18n } from '@/hooks/useClientI18n';

interface OrderTemplate {
  templateId: string;
  templateName: string;
  paymentType: 'onetime' | 'subscription';
  serviceType: 'product' | 'project';
  amount: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function OrderTemplatesPage() {
  const { t } = useClientI18n();
  const router = useRouter();
  const [templates, setTemplates] = useState<OrderTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // モーダル状態管理
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<OrderTemplate | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<OrderTemplate | null>(null);
  const [isCreateOrderDialogOpen, setIsCreateOrderDialogOpen] = useState(false);
  const [selectedTemplateForOrder, setSelectedTemplateForOrder] = useState<OrderTemplate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<OrderTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const response = await fetch(`/api/order-templates?${params}`);
      const data = await response.json();
      
      setTemplates(data.templates || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0
      }));
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (template: OrderTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleView = (template: OrderTemplate) => {
    setViewingTemplate(template);
    setIsDetailDialogOpen(true);
  };

  const handleUseTemplate = (template: OrderTemplate) => {
    setSelectedTemplateForOrder(template);
    setIsCreateOrderDialogOpen(true);
  };

  const handleDelete = (template: OrderTemplate) => {
    setDeletingTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTemplate) return;

    try {
      const response = await fetch(`/api/order-templates/${deletingTemplate.templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTemplates();
      } else {
        console.error('Failed to delete template');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleStatusToggle = async (templateId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/order-templates/${templateId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        fetchTemplates();
      } else {
        console.error('Failed to update template status');
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const handleAddTemplate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleFormSuccess = () => {
    fetchTemplates();
  };

  const headerActions = (
    <button
      onClick={handleAddTemplate}
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
      {t('addTemplate')}
    </button>
  );

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'white',
      minHeight: '100vh'
    }}>
      <PageHeader
        title={t('orderTemplates')}
        description={t('orderTemplateManagement')}
        actions={headerActions}
      />

      <div style={{ 
        padding: isMobile ? '12px 16px' : '16px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <TemplateTable
          templates={templates}
          loading={loading}
          onEdit={handleEdit}
          onView={handleView}
          onUseTemplate={handleUseTemplate}
          onDelete={handleDelete}
          onStatusToggle={handleStatusToggle}
        />

        {/* モーダル */}
        <TemplateModal
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={handleFormSuccess}
        />

        <TemplateModal
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingTemplate(null);
          }}
          onSuccess={handleFormSuccess}
          editingTemplate={editingTemplate}
        />

        <TemplateDetailModal
          isOpen={isDetailDialogOpen}
          onClose={() => {
            setIsDetailDialogOpen(false);
            setViewingTemplate(null);
          }}
          template={viewingTemplate}
        />

        <CreateOrderModal
          isOpen={isCreateOrderDialogOpen}
          onClose={() => {
            setIsCreateOrderDialogOpen(false);
            setSelectedTemplateForOrder(null);
          }}
          template={selectedTemplateForOrder}
          onConfirm={(templateId) => {
            router.push(`/orders/new?templateId=${templateId}`);
          }}
        />

        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeletingTemplate(null);
          }}
          onConfirm={handleConfirmDelete}
          templateName={deletingTemplate ? deletingTemplate.templateName : ''}
        />

        {/* ページネーション */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isMobile ? '4px' : '8px',
            marginTop: '20px',
            flexWrap: 'wrap'
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