'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CustomSelect } from '../../orders/components/CustomSelect';
import { SearchableCustomerSelect } from '../../orders/components/SearchableCustomerSelect';
import { AmountInput } from '../../orders/components/AmountInput';
import { useClientI18n } from '@/hooks/useClientI18n';

interface Customer {
  customerId: string;
  customerName: string;
}

interface OrderTemplate {
  templateId: string;
  paymentType: 'onetime' | 'subscription';
  templateName: string;
  amount: string;
  description: string | null;
}

interface SubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubscriptionForm({ isOpen, onClose, onSuccess }: SubscriptionFormProps) {
  const { t, getLanguage } = useClientI18n();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<OrderTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    startDate: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch customer list
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchTemplates();
    }
  }, [isOpen]);

  // Reset form when creating new subscription
  useEffect(() => {
    if (isOpen) {
      setFormData({
        customerId: '',
        amount: '',
        startDate: '',
        description: ''
      });
      setError('');
      setSelectedTemplate('');
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers?limit=1000');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch {
      // Failed to fetch customer data
    }
  };

  const fetchTemplates = async () => {
    try {
      // Fetch only subscription templates
      const response = await fetch('/api/order-templates?paymentType=subscription');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch {
      // Failed to fetch subscription templates
      setTemplates([]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);

    if (templateId) {
      const template = templates.find(t => t.templateId === templateId);
      if (template) {
        setFormData(prev => ({
          ...prev,
          amount: template.amount,
          description: template.description || ''
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId || !formData.amount || !formData.startDate) {
      setError(t('requiredFieldsError'));
      return;
    }

    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setError(t('amountValidationError'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create subscription
      const subscriptionResponse = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: formData.customerId,
          description: formData.description
        }),
      });

      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.json();
        setError(errorData.error || 'Failed to create subscription');
        return;
      }

      const subscriptionData = await subscriptionResponse.json();
      const subscriptionId = subscriptionData.subscription.subscriptionId;

      // Set subscription pricing
      const amountResponse = await fetch('/api/subscription-amounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscriptionId,
          amount: Number(formData.amount),
          startDate: formData.startDate,
          endDate: null // Ongoing
        }),
      });

      if (!amountResponse.ok) {
        const errorData = await amountResponse.json();
        setError(errorData.error || 'Failed to set subscription amount');
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError('Failed to create subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-[600px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-900 m-0">
            {t('newSubscription')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 border-0 bg-transparent cursor-pointer rounded-md hover:bg-gray-100"
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-5">
            <p className="text-red-600 text-sm m-0">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5">
            {templates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('planTemplate')}
                </label>
                <CustomSelect
                  options={[
                    { value: '', label: t('selectTemplateOptional') },
                    ...templates.map(template => ({
                      value: template.templateId,
                      label: `${template.templateName} (¥${Number(template.amount).toLocaleString()})`
                    }))
                  ]}
                  value={selectedTemplate}
                  onChange={handleTemplateSelect}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('customer')} <span className="text-red-600">*</span>
              </label>
              <SearchableCustomerSelect
                customers={customers}
                value={formData.customerId}
                onChange={(value) => handleInputChange('customerId', value)}
                placeholder={t('selectCustomer')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('monthlyFeeRequired')} <span className="text-red-600">*</span>
              </label>
              <AmountInput
                value={formData.amount}
                onChange={(value) => handleInputChange('amount', value)}
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('startDateRequired')} <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                placeholder="開始日を選択"
                lang={getLanguage() === 'ja' ? 'ja' : 'en'}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm box-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm box-border resize-y"
                placeholder={t('subscriptionDescriptionPlaceholder')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white border-0 rounded-md ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 cursor-pointer hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? t('creating') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}