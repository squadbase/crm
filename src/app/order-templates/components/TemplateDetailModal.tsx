'use client';

import { X, Calendar, DollarSign, FileText, Tag } from 'lucide-react';
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

interface TemplateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: OrderTemplate | null;
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  const { t } = useClientI18n();
  return (
    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
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
    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
      isSubscription ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'
    }`}>
      {isSubscription ? t('subscriptionTemplate') : t('onetimeTemplate')}
    </span>
  );
}

export function TemplateDetailModal({ isOpen, onClose, template }: TemplateDetailModalProps) {
  const { t, formatCurrency, formatDate } = useClientI18n();

  if (!isOpen || !template) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900 m-0 mb-1">
              {template.templateName}
            </h2>
            <StatusBadge isActive={template.isActive} />
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-transparent border-none rounded cursor-pointer text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 m-0 mb-4 flex items-center gap-2">
                <Tag size={18} />
                {t('basicInformation')}
              </h3>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    {t('paymentTypeTemplate')}
                  </div>
                  <PaymentTypeBadge paymentType={template.paymentType} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 m-0 mb-4 flex items-center gap-2">
                <DollarSign size={18} />
                {t('amountTemplate')}
              </h3>

              <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {formatCurrency(parseInt(template.amount))}
                </div>
                <div className="text-sm text-gray-500">
                  {template.paymentType === 'subscription' ? t('subscriptionPaymentTemplate') : t('onetimeTemplate')}
                </div>
              </div>
            </div>

            {template.description && (
              <div>
                <h3 className="text-base font-semibold text-gray-900 m-0 mb-4 flex items-center gap-2">
                  <FileText size={18} />
                  {t('descriptionTemplate')}
                </h3>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 m-0 leading-relaxed whitespace-pre-wrap">
                    {template.description}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-base font-semibold text-gray-900 m-0 mb-4 flex items-center gap-2">
                <Calendar size={18} />
                {t('history')}
              </h3>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    {t('created')}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    {formatDate(template.createdAt)}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    {t('lastUpdatedTemplate')}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    {formatDate(template.updatedAt)}
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-400 text-xs text-yellow-800">
                {t('templateIdTemplate')}: {template.templateId}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-6 py-5 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border-none rounded cursor-pointer"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}