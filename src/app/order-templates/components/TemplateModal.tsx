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
      newErrors.templateName = 'テンプレート名は255文字以内で入力してください';
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
        const errorData = await response.json();
        console.error('Failed to save template:', errorData);
      }
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px'
      }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            {editingTemplate ? t('editTemplateTitle') : t('createTemplate')}
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* テンプレート名 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('templateName')} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.templateName}
                onChange={(e) => handleInputChange('templateName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${errors.templateName ? '#dc2626' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder={t('templateNamePlaceholder')}
              />
              {errors.templateName && (
                <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                  {errors.templateName}
                </span>
              )}
            </div>

            {/* 支払い形態 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('paymentTypeTemplate')} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                value={formData.paymentType}
                onChange={(e) => handleInputChange('paymentType', e.target.value as 'onetime' | 'subscription')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="onetime">{t('onetimeTemplate')}</option>
                <option value="subscription">{t('subscriptionTemplate')}</option>
              </select>
            </div>

            {/* 金額 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('amountTemplate')} (円) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${errors.amount ? '#dc2626' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder={t('amountPlaceholder')}
              />
              {errors.amount && (
                <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                  {errors.amount}
                </span>
              )}
            </div>

            {/* 説明 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('descriptionTemplate')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder={t('templateDescriptionPlaceholder')}
              />
            </div>

            {/* アクティブ状態 */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                {editingTemplate ? t('active') : 'アクティブ状態で作成'}
              </label>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? t('saving') : (editingTemplate ? t('update') : t('create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}