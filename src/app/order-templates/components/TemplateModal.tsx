'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTemplate?: OrderTemplate | null;
}

interface FormData {
  templateName: string;
  paymentType: 'onetime' | 'subscription';
  amount: string;
  description: string;
  isActive: boolean;
}

export function TemplateModal({ isOpen, onClose, onSuccess, editingTemplate }: TemplateModalProps) {
  const { t } = useClientI18n();
  const [formData, setFormData] = useState<FormData>({
    templateName: '',
    paymentType: 'onetime',
    amount: '',
    description: '',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingTemplate) {
      setFormData({
        templateName: editingTemplate.templateName,
        paymentType: editingTemplate.paymentType,
        amount: editingTemplate.amount,
        description: editingTemplate.description || '',
        isActive: editingTemplate.isActive
      });
    } else {
      setFormData({
        templateName: '',
        paymentType: 'onetime',
        amount: '',
        description: '',
        isActive: true
      });
    }
    setErrors({});
  }, [editingTemplate, isOpen]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.templateName.trim()) {
      newErrors.templateName = t('requiredFieldError');
    } else if (formData.templateName.length > 255) {
      newErrors.templateName = 'Template name must be within 255 characters';
    }

    if (!formData.amount) {
      newErrors.amount = t('requiredFieldError');
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = t('amountValidationErrorTemplate');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const url = editingTemplate
        ? `/api/order-templates/${editingTemplate.templateId}`
        : '/api/order-templates';
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        // Template save operation failed
        await response.json();
      }
    } catch {
      // Template save request failed
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 m-0">
            {editingTemplate ? t('editTemplateTitle') : t('createTemplate')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 bg-transparent border-none rounded cursor-pointer text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('templateName')} <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.templateName}
                onChange={(e) => handleInputChange('templateName', e.target.value)}
                className={`w-full px-3 py-2 text-sm outline-none rounded box-border ${
                  errors.templateName ? 'border border-red-600' : 'border border-gray-300'
                }`}
                placeholder={t('templateNamePlaceholder')}
              />
              {errors.templateName && (
                <span className="text-xs text-red-600 mt-1 block">
                  {errors.templateName}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('paymentTypeTemplate')} <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.paymentType}
                onChange={(e) => handleInputChange('paymentType', e.target.value as 'onetime' | 'subscription')}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white outline-none box-border"
              >
                <option value="onetime">{t('onetimeTemplate')}</option>
                <option value="subscription">{t('subscriptionTemplate')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('amountTemplate')} <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`w-full px-3 py-2 text-sm outline-none rounded box-border ${
                  errors.amount ? 'border border-red-600' : 'border border-gray-300'
                }`}
                placeholder={t('amountPlaceholder')}
              />
              {errors.amount && (
                <span className="text-xs text-red-600 mt-1 block">
                  {errors.amount}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('descriptionTemplate')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none resize-y box-border"
                placeholder={t('templateDescriptionPlaceholder')}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                {editingTemplate ? t('active') : t('createAsActive')}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white border-none rounded ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'
              }`}
            >
              {loading ? t('saving') : (editingTemplate ? t('update') : t('create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}