'use client';

import { X, AlertTriangle } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  templateName: string;
}

export function DeleteConfirmDialog({ isOpen, onClose, onConfirm, templateName }: DeleteConfirmDialogProps) {
  const { t } = useClientI18n();
  
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
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
          maxWidth: '400px',
          overflow: 'hidden'
        }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={20} style={{ color: '#dc2626' }} />
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#dc2626',
              margin: 0
            }}>
              {t('deleteTemplateTitle')}
            </h2>
          </div>
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
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            marginBottom: '20px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#7f1d1d',
              margin: 0,
              lineHeight: '1.5'
            }}>
              <strong>{t('warning')}:</strong> This action cannot be undone.
            </p>
          </div>

          <p style={{
            fontSize: '14px',
            color: '#374151',
            margin: 0,
            marginBottom: '16px',
            lineHeight: '1.5'
          }}>
            {t('deleteTemplateConfirm')}
          </p>

          <div style={{
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827'
            }}>
              {templateName}
            </div>
          </div>

          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            {t('deleteTemplateWarning')}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '20px 24px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
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
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
              backgroundColor: '#dc2626',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {t('deleteTemplateAction')}
          </button>
        </div>
      </div>
    </div>
  );
}