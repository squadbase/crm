'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import { SearchableCustomerSelect } from './SearchableCustomerSelect';
import { AmountInput } from './AmountInput';
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

interface Order {
  orderId: string;
  customerId: string;
  customerName: string;
  salesAt: string | null | undefined;
  amount: string;
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
  const { t, getLanguage } = useClientI18n();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<OrderTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState({
    customerId: '',
    salesAt: '',
    amount: '',
    isPaid: false,
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

  // Fetch all templates on initial load
  useEffect(() => {
    if (isOpen && !editingOrder) {
      fetchTemplates();
    }
  }, [isOpen, editingOrder]);

  // Set form data when editing
  useEffect(() => {
    if (editingOrder) {
      setFormData({
        customerId: editingOrder.customerId,
        salesAt: editingOrder.salesAt || '',
        amount: editingOrder.amount,
        isPaid: editingOrder.isPaid,
        description: editingOrder.description || ''
      });
    } else {
      // Reset form for new creation
      setFormData({
        customerId: '',
        salesAt: '',
        amount: '',
        isPaid: false,
        description: ''
      });
    }
    setError('');
    setSelectedTemplate(''); // Reset template selection
  }, [editingOrder, isOpen]);

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
      // Fetch only onetime templates
      const response = await fetch('/api/order-templates?paymentType=onetime');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch {
      // Failed to fetch order templates
      setTemplates([]);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
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

    if (!formData.customerId || !formData.salesAt || !formData.amount) {
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
        amount: Number(formData.amount)
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
        {/* Header */}
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

        {/* Error message */}
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            {/* Template selection */}
            {!editingOrder && templates.length > 0 && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t('selectTemplate')}
                </label>
                <CustomSelect
                  options={[
                    { value: '', label: t('noTemplate') },
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

            {/* Customer selection */}
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


            {/* Sales date */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Sales date <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.salesAt}
                onChange={(e) => handleInputChange('salesAt', e.target.value)}
                placeholder="Select sales date"
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

            {/* Amount */}
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
              <AmountInput
                value={formData.amount}
                onChange={(value) => handleInputChange('amount', value)}
                placeholder="0"
                required
              />

            </div>

            {/* Description */}
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

          {/* Payment status */}
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

          {/* Buttons */}
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