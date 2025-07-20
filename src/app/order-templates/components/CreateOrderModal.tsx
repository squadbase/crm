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
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      fontSize: '12px',
      fontWeight: '500',
      borderRadius: '9999px',
      backgroundColor: isSubscription ? '#e0e7ff' : '#f3e8ff',
      color: isSubscription ? '#3730a3' : '#6b21a8'
    }}>
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
            {t('createOrderFromTemplate')}
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

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #0ea5e9',
            marginBottom: '24px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#0c4a6e',
              margin: 0,
              lineHeight: '1.5'
            }}>
              {t('createOrderFromTemplateDescription')}
            </p>
          </div>

          {/* Template Preview */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <FileText size={16} style={{ color: '#6b7280' }} />
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                margin: 0
              }}>
                {t('templateDetails')}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* テンプレート名 */}
              <div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  {template.templateName}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <PaymentTypeBadge paymentType={template.paymentType} />
                </div>
              </div>

              {/* 金額 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <DollarSign size={16} style={{ color: '#16a34a' }} />
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {t('amountTemplate')}:
                </span>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  {formatCurrency(parseInt(template.amount))}
                </span>
              </div>

              {/* 説明 */}
              {template.description && (
                <div style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    {t('descriptionTemplate')}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: '1.4'
                  }}>
                    {template.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div style={{
            padding: '16px',
            backgroundColor: '#fefce8',
            borderRadius: '8px',
            border: '1px solid #eab308',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <Calendar size={16} style={{ color: '#a16207' }} />
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#a16207',
                margin: 0
              }}>
                {t('nextSteps')}
              </h4>
            </div>
            <ol style={{
              fontSize: '14px',
              color: '#a16207',
              margin: 0,
              paddingLeft: '20px',
              lineHeight: '1.5'
            }}>
              <li>{t('newOrderModal')}ページに移動</li>
              <li>{t('customer')}を選択</li>
              <li>必要に応じて{t('amountTemplate')}や{t('descriptionTemplate')}を調整</li>
              <li>注文を作成</li>
            </ol>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '20px 24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
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
            onClick={handleConfirm}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {t('createOrderPageRedirect')}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}