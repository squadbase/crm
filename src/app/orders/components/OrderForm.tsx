'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import { useClientI18n } from '@/hooks/useClientI18n';

interface Customer {
  customerId: string;
  customerName: string;
}

interface Order {
  orderId: string;
  customerId: string;
  customerName: string;
  paymentType: 'onetime' | 'subscription';
  serviceType: 'squadbase' | 'project';
  salesStartDt: string;
  salesEndDt: string | null;
  amount: string;
  currency: string;
  isPaid: boolean;
  description: string | null;
}

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingOrder?: Order | null;
}

export function OrderForm({ isOpen, onClose, onSuccess, editingOrder }: OrderFormProps) {
  const { t } = useClientI18n();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    paymentType: 'onetime' as 'onetime' | 'subscription',
    serviceType: 'squadbase' as 'squadbase' | 'project',
    salesStartDt: '',
    salesEndDt: '',
    amount: '',
    currency: 'JPY',
    isPaid: false,
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 顧客一覧を取得
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  // 編集時にフォームデータを設定
  useEffect(() => {
    if (editingOrder) {
      setFormData({
        customerId: editingOrder.customerId,
        paymentType: editingOrder.paymentType,
        serviceType: editingOrder.serviceType,
        salesStartDt: editingOrder.salesStartDt,
        salesEndDt: editingOrder.salesEndDt || '',
        amount: editingOrder.amount,
        currency: editingOrder.currency,
        isPaid: editingOrder.isPaid,
        description: editingOrder.description || ''
      });
    } else {
      // 新規作成時はフォームをリセット
      setFormData({
        customerId: '',
        paymentType: 'onetime',
        serviceType: 'squadbase',
        salesStartDt: '',
        salesEndDt: '',
        amount: '',
        currency: 'JPY',
        isPaid: false,
        description: ''
      });
    }
    setError('');
  }, [editingOrder, isOpen]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers?limit=1000');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId || !formData.salesStartDt || !formData.amount) {
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
      const url = editingOrder 
        ? `/api/orders/${editingOrder.orderId}`
        : '/api/orders';
      
      const method = editingOrder ? 'PUT' : 'POST';
      
      const requestData = {
        ...formData,
        amount: Number(formData.amount),
        salesEndDt: formData.salesEndDt || null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || t('saveFailedError'));
      }
    } catch {
      setError(t('saveFailedError'));
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
            {editingOrder ? t('editOrder') : t('newOrder')}
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
              <CustomSelect
                options={[
                  { value: '', label: t('selectCustomer') },
                  ...customers.map(customer => ({
                    value: customer.customerId,
                    label: customer.customerName
                  }))
                ]}
                value={formData.customerId}
                onChange={(value) => handleInputChange('customerId', value)}
                placeholder={t('selectCustomer')}
                required
              />
            </div>

            {/* 支払い種別とサービス種別 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t('paymentType')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <CustomSelect
                  options={[
                    { value: 'onetime', label: t('oneTime') },
                    { value: 'subscription', label: t('subscription') }
                  ]}
                  value={formData.paymentType}
                  onChange={(value) => handleInputChange('paymentType', value as 'onetime' | 'subscription')}
                  required
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t('serviceType')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <CustomSelect
                  options={[
                    { value: 'squadbase', label: t('squadbaseService') },
                    { value: 'project', label: t('projectService') }
                  ]}
                  value={formData.serviceType}
                  onChange={(value) => handleInputChange('serviceType', value as 'squadbase' | 'project')}
                  required
                />
              </div>
            </div>

            {/* 契約開始日と終了日 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t('contractStartDate')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.salesStartDt}
                  onChange={(e) => handleInputChange('salesStartDt', e.target.value)}
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t('contractEndDate')}
                </label>
                <input
                  type="date"
                  value={formData.salesEndDt}
                  onChange={(e) => handleInputChange('salesEndDt', e.target.value)}
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
            </div>

            {/* 金額と通貨 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t('amount')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  required
                  min="1"
                  step="1"
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t('currency')}
                </label>
                <CustomSelect
                  options={[
                    { value: 'JPY', label: 'JPY' },
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' }
                  ]}
                  value={formData.currency}
                  onChange={(value) => handleInputChange('currency', value)}
                />
              </div>
            </div>

            {/* 支払い状況 */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.isPaid}
                  onChange={(e) => handleInputChange('isPaid', e.target.checked)}
                  style={{
                    marginRight: '8px'
                  }}
                />
                {t('isPaidLabel')}
              </label>
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
                placeholder={t('descriptionPlaceholder')}
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
              {isSubmitting ? t('saving') : editingOrder ? t('update') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}