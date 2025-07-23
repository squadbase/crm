'use client';

import { X, ArrowRight, FileText, DollarSign, Calendar } from 'lucide-react';
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

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: OrderTemplate | null;
  onConfirm: (templateId: string) => void;
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

export function CreateOrderModal({ isOpen, onClose, template, onConfirm }: CreateOrderModalProps) {
  const { t, formatCurrency } = useClientI18n();
  
  if (!isOpen || !template) return null;

  const handleConfirm = () => {
    onConfirm(template.templateId);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 m-0">
            {t('createOrderFromTemplate')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 bg-transparent border-none rounded cursor-pointer text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="p-4 bg-sky-50 rounded-lg border border-sky-500 mb-6">
            <p className="text-sm text-sky-900 m-0 leading-6">
              {t('createOrderFromTemplateDescription')}
            </p>
          </div>

          {/* Template Preview */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700 m-0">
                {t('templateDetails')}
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {/* Template name */}
              <div>
                <div className="text-base font-semibold text-gray-900 mb-1">
                  {template.templateName}
                </div>
                <div className="flex items-center gap-2">
                  <PaymentTypeBadge paymentType={template.paymentType} />
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-center gap-2 p-3 bg-white rounded border border-gray-200">
                <DollarSign size={16} className="text-green-600" />
                <span className="text-sm text-gray-500">
                  {t('amountTemplate')}:
                </span>
                <span className="text-base font-semibold text-gray-900">
                  {formatCurrency(parseInt(template.amount))}
                </span>
              </div>

              {/* Description */}
              {template.description && (
                <div className="p-3 bg-white rounded border border-gray-200">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    {t('descriptionTemplate')}
                  </div>
                  <div className="text-sm text-gray-700 leading-snug">
                    {template.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-500 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-yellow-700" />
              <h4 className="text-sm font-semibold text-yellow-700 m-0">
                {t('nextSteps')}
              </h4>
            </div>
            <ol className="text-sm text-yellow-700 m-0 pl-5 leading-6">
              <li>{t('newOrderModal')}{t('goToOrderPage')}</li>
              <li>{t('customer')}{t('selectCustomerStep')}</li>
              <li>{t('adjustFieldsStep')}</li>
              <li>{t('createOrderStep')}</li>
            </ol>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 border-none rounded cursor-pointer"
          >
            {t('createOrderPageRedirect')}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}