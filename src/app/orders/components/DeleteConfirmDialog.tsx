'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  orderName: string;
}

export function DeleteConfirmDialog({ isOpen, onClose, onConfirm, orderName }: DeleteConfirmDialogProps) {
  const { t } = useClientI18n();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Delete operation failed - error handling preserved for UI state
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
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
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              padding: '8px',
              backgroundColor: '#fef2f2',
              borderRadius: '8px'
            }}>
              <AlertTriangle size={20} color="#dc2626" />
            </div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              margin: 0
            }}>
              {t('deleteOrder')}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            style={{
              padding: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              borderRadius: '4px',
              opacity: isDeleting ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <X size={16} color="#6b7280" />
          </button>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{
            fontSize: '14px',
            color: '#374151',
            lineHeight: 1.6,
            margin: '0 0 16px 0'
          }}>
            {t('deleteConfirmMessage')}
          </p>
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#0f172a',
              margin: 0
            }}>
              {orderName}
            </p>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#dc2626',
            lineHeight: 1.6,
            margin: 0
          }}>
            <strong>{t('warning')}:</strong> {t('deleteWarning')}
          </p>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            disabled={isDeleting}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
              backgroundColor: isDeleting ? '#9ca3af' : '#dc2626',
              border: 'none',
              borderRadius: '6px',
              cursor: isDeleting ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#b91c1c';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }
            }}
          >
            {isDeleting ? t('deleting') : t('deleteAction')}
          </button>
        </div>
      </div>
    </div>
  );
}