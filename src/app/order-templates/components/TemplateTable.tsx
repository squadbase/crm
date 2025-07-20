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
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      fontSize: '12px',
      fontWeight: '500',
      borderRadius: '9999px',
      backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
      color: isActive ? '#166534' : '#991b1b'
    }}>
      {isActive ? t('active') : t('inactive')}
    </span>
  );
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
      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ color: '#6b7280' }}>{t('loadingTemplates')}</div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ color: '#6b7280', marginBottom: '8px' }}>{t('noTemplatesFound')}</div>
        <div style={{ fontSize: '14px', color: '#9ca3af' }}>
          {t('noTemplatesFoundDescription')}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          minWidth: '800px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {t('templateName')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                minWidth: '140px',
                whiteSpace: 'nowrap'
              }}>
                {t('paymentTypeTemplate')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {t('amountTemplate')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {t('descriptionTemplate')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                minWidth: '140px',
                whiteSpace: 'nowrap'
              }}>
                {t('statusTemplate')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {t('lastUpdatedTemplate')}
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {t('actionsTemplate')}
              </th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr
                key={template.templateId}
                style={{
                  backgroundColor: hoveredRow === template.templateId ? '#f9fafb' : 'white',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={() => setHoveredRow(template.templateId)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  verticalAlign: 'middle'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827',
                    marginBottom: '2px'
                  }}>
                    {template.templateName}
                  </div>
                </td>
                <td style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  verticalAlign: 'middle',
                  minWidth: '140px',
                  whiteSpace: 'nowrap'
                }}>
                  <PaymentTypeBadge paymentType={template.paymentType} />
                </td>
                <td style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  textAlign: 'right',
                  verticalAlign: 'middle'
                }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {formatCurrency(parseInt(template.amount))}
                  </span>
                </td>
                <td style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  verticalAlign: 'middle'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {template.description || '—'}
                  </div>
                </td>
                <td style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  minWidth: '140px',
                  whiteSpace: 'nowrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <StatusBadge isActive={template.isActive} />
                    <button
                      onClick={() => onStatusToggle(template.templateId, !template.isActive)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={template.isActive ? t('deactivateTemplate') : t('activateTemplate')}
                    >
                      {template.isActive ? (
                        <ToggleRight size={20} style={{ color: '#16a34a' }} />
                      ) : (
                        <ToggleLeft size={20} style={{ color: '#9ca3af' }} />
                      )}
                    </button>
                  </div>
                </td>
                <td style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  verticalAlign: 'middle'
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {formatDate(template.updatedAt)}
                  </span>
                </td>
                <td style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  textAlign: 'center',
                  verticalAlign: 'middle'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}>
                    <button
                      onClick={() => onView(template)}
                      style={{
                        padding: '6px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#6b7280',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.color = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#6b7280';
                      }}
                      title={t('viewTemplate')}
                    >
                      <Eye size={16} />
                    </button>
                    
                    <button
                      onClick={() => onUseTemplate(template)}
                      disabled={!template.isActive}
                      style={{
                        padding: '6px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: template.isActive ? 'pointer' : 'not-allowed',
                        color: template.isActive ? '#16a34a' : '#9ca3af',
                        transition: 'all 0.2s',
                        opacity: template.isActive ? 1 : 0.5
                      }}
                      onMouseEnter={(e) => {
                        if (template.isActive) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.color = '#15803d';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (template.isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#16a34a';
                        }
                      }}
                      title={t('useTemplate')}
                    >
                      <PlayCircle size={16} />
                    </button>
                    
                    <button
                      onClick={() => onEdit(template)}
                      style={{
                        padding: '6px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#6b7280',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.color = '#7c3aed';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#6b7280';
                      }}
                      title={t('editTemplate')}
                    >
                      <Edit size={16} />
                    </button>
                    
                    <button
                      onClick={() => onDelete(template)}
                      style={{
                        padding: '6px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#6b7280',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.color = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#6b7280';
                      }}
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