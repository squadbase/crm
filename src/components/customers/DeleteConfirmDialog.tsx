'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  customerName: string;
}

export function DeleteConfirmDialog({ isOpen, onClose, onConfirm, customerName }: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch {
      // Error handling is done in the parent component
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-sm m-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-red-50 rounded-full">
              <AlertTriangle className="h-4.5 w-4.5 text-red-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">
              Delete Customer
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-transparent border-none rounded-md cursor-pointer transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Are you sure you want to delete <strong>{customerName}</strong>? 
            This action cannot be undone.
          </p>

          <div className="p-3 bg-yellow-50 rounded-md mb-6">
            <p className="text-xs text-yellow-800 m-0 leading-tight">
              <strong>Note:</strong> If this customer has related orders, the deletion will be prevented.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md transition-colors ${
                isDeleting 
                  ? 'cursor-not-allowed opacity-60' 
                  : 'cursor-pointer hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className={`flex items-center px-4 py-2 text-sm font-medium text-white border-none rounded-md transition-colors ${
                isDeleting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 cursor-pointer hover:bg-red-700'
              }`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Customer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}