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
  
  // Set page title
  useEffect(() => {
    document.title = t('orderTemplatesTitle');
  }, [t]);
  const [templates, setTemplates] = useState<OrderTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // Modal state management
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
    } catch {
      // Error handled silently - failed to fetch templates
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
        // Failed to delete template
      }
    } catch {
      // Delete error - handled silently
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
        // Failed to update template status
      }
    } catch {
      // Status update error - handled silently
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
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border-none rounded cursor-pointer"
    >
      <Plus size={16} />
      {t('addTemplate')}
    </button>
  );

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <PageHeader
        title={t('orderTemplates')}
        description={t('orderTemplateManagement')}
        actions={headerActions}
      />

      <div className={`max-w-6xl mx-auto w-full ${
        isMobile ? 'px-4 py-3' : 'px-6 py-4'
      }`}>
        <TemplateTable
          templates={templates}
          loading={loading}
          onEdit={handleEdit}
          onView={handleView}
          onUseTemplate={handleUseTemplate}
          onDelete={handleDelete}
          onStatusToggle={handleStatusToggle}
        />

        {/* Modals */}
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className={`flex justify-center items-center mt-5 flex-wrap ${
            isMobile ? 'gap-1' : 'gap-2'
          }`}>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className={`px-3 py-2 border border-gray-300 rounded bg-white ${
                pagination.page === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
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
              className={`px-3 py-2 border border-gray-300 rounded bg-white ${
                pagination.page === pagination.totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
            >
              {t('next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}