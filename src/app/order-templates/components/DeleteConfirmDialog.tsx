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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            <h2 className="text-lg font-semibold text-red-600 m-0">
              {t('deleteTemplateTitle')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-transparent border-none rounded cursor-pointer text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-5">
            <p className="text-sm text-red-900 m-0 leading-6">
              <strong>{t('warning')}:</strong> This action cannot be undone.
            </p>
          </div>

          <p className="text-sm text-gray-700 m-0 mb-4 leading-6">
            {t('deleteTemplateConfirm')}
          </p>

          <div className="p-3 bg-gray-50 rounded border border-gray-200 mb-5">
            <div className="text-base font-semibold text-gray-900">
              {templateName}
            </div>
          </div>

          <div className="text-sm text-gray-500 leading-6">
            {t('deleteTemplateWarning')}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border-none rounded cursor-pointer"
          >
            {t('deleteTemplateAction')}
          </button>
        </div>
      </div>
    </div>
  );
}