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

  // 顧客一覧を取得
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchTemplates();
    }
  }, [isOpen]);

  // 新規作成時にフォームをリセット
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
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      // subscriptionテンプレートのみを取得
      const response = await fetch('/api/order-templates?paymentType=subscription');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
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
      // サブスクリプション作成
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

      // サブスクリプション料金設定
      const amountResponse = await fetch('/api/subscription-amounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscriptionId,
          amount: Number(formData.amount),
          startDate: formData.startDate,
          endDate: null // 継続中
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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
      onClick={handleOverlayClick}
    >
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0f172a',
            margin: 0
          }}>
            {t('newSubscription')}
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              borderRadius: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <p style={{
              color: '#dc2626',
              fontSize: '14px',
              margin: 0
            }}>
              {error}
            </p>
          </div>
        )}

        {/* フォーム */}
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            {/* テンプレート選択 */}
            {templates.length > 0 && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
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

            {/* 顧客選択 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('customer')} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <SearchableCustomerSelect
                customers={customers}
                value={formData.customerId}
                onChange={(value) => handleInputChange('customerId', value)}
                placeholder={t('selectCustomer')}
                required
              />
            </div>

            {/* 月額料金 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('monthlyFeeRequired')} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <AmountInput
                value={formData.amount}
                onChange={(value) => handleInputChange('amount', value)}
                placeholder="0"
                required
              />
            </div>

            {/* 開始日 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('startDateRequired')} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                placeholder="開始日を選択"
                lang={getLanguage() === 'ja' ? 'ja' : 'en'}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
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
                {t('description')}
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
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
                placeholder={t('subscriptionDescriptionPlaceholder')}
              />
            </div>
          </div>

          {/* ボタン */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '32px'
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
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: isSubmitting ? '#9ca3af' : '#2563eb',
                border: 'none',
                borderRadius: '6px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }
              }}
            >
              {isSubmitting ? t('creating') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}