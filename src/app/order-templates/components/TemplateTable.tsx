'use client';

import { useState } from 'react';
import { Eye, Edit, Trash2, PlayCircle, ToggleLeft, ToggleRight } from 'lucide-react';
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

interface TemplateTableProps {
  templates: OrderTemplate[];
  loading: boolean;
  onEdit: (template: OrderTemplate) => void;
  onView: (template: OrderTemplate) => void;
  onUseTemplate: (template: OrderTemplate) => void;
  onDelete: (template: OrderTemplate) => void;
  onStatusToggle: (templateId: string, isActive: boolean) => void;
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  const { t } = useClientI18n();
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
      isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? t('active') : t('inactive')}
    </span>
  );
}


function PaymentTypeBadge({ paymentType }: { paymentType: 'onetime' | 'subscription' }) {
  const { t } = useClientI18n();
  const isSubscription = paymentType === 'subscription';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
      isSubscription ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'
    }`}>
      {isSubscription ? t('subscriptionTemplate') : t('onetimeTemplate')}
    </span>
  );
}

export function TemplateTable({ 
  templates, 
  loading, 
  onEdit, 
  onView, 
  onUseTemplate, 
  onDelete, 
  onStatusToggle 
}: TemplateTableProps) {
  const { t, formatCurrency, formatDate } = useClientI18n();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  
  if (loading) {
    return (
      <div className="p-10 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="text-gray-500">{t('loadingTemplates')}</div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="p-10 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="text-gray-500 mb-2">{t('noTemplatesFound')}</div>
        <div className="text-sm text-gray-400">
          {t('noTemplatesFoundDescription')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                {t('templateName')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-b border-gray-200 min-w-[140px] whitespace-nowrap">
                {t('paymentTypeTemplate')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 border-b border-gray-200">
                {t('amountTemplate')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                {t('descriptionTemplate')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 border-b border-gray-200 min-w-[140px] whitespace-nowrap">
                {t('statusTemplate')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                {t('lastUpdatedTemplate')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 border-b border-gray-200">
                {t('actionsTemplate')}
              </th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template, index) => (
              <tr
                key={`template-${template.templateId}-${index}`}
                className={`transition-colors duration-200 ${
                  hoveredRow === template.templateId ? 'bg-gray-50' : 'bg-white'
                }`}
                onMouseEnter={() => setHoveredRow(template.templateId)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-4 py-3 border-b border-gray-100 align-middle">
                  <div className="text-sm font-medium text-gray-900 mb-0.5">
                    {template.templateName}
                  </div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 align-middle min-w-[140px] whitespace-nowrap">
                  <PaymentTypeBadge paymentType={template.paymentType} />
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-right align-middle">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(parseInt(template.amount))}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 align-middle">
                  <div className="text-sm text-gray-500 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {template.description || '—'}
                  </div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-center align-middle min-w-[140px] whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <StatusBadge isActive={template.isActive} />
                    <button
                      onClick={() => onStatusToggle(template.templateId, !template.isActive)}
                      className="bg-transparent border-none cursor-pointer p-0.5 flex items-center"
                      title={template.isActive ? t('deactivateTemplate') : t('activateTemplate')}
                    >
                      {template.isActive ? (
                        <ToggleRight size={20} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={20} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 align-middle">
                  <span className="text-sm text-gray-500">
                    {formatDate(template.updatedAt)}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-center align-middle">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onView(template)}
                      className="p-1.5 bg-transparent border-none rounded cursor-pointer text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-blue-600"
                      title={t('viewTemplate')}
                    >
                      <Eye size={16} />
                    </button>
                    
                    <button
                      onClick={() => onUseTemplate(template)}
                      disabled={!template.isActive}
                      className={`p-1.5 bg-transparent border-none rounded transition-all duration-200 ${
                        template.isActive
                          ? 'cursor-pointer text-green-600 hover:bg-gray-100 hover:text-green-700'
                          : 'cursor-not-allowed text-gray-400 opacity-50'
                      }`}
                      title={t('useTemplate')}
                    >
                      <PlayCircle size={16} />
                    </button>
                    
                    <button
                      onClick={() => onEdit(template)}
                      className="p-1.5 bg-transparent border-none rounded cursor-pointer text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-violet-600"
                      title={t('editTemplate')}
                    >
                      <Edit size={16} />
                    </button>
                    
                    <button
                      onClick={() => onDelete(template)}
                      className="p-1.5 bg-transparent border-none rounded cursor-pointer text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-red-600"
                      title={t('deleteTemplate')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}