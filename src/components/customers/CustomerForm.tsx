'use client';

import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

interface Customer {
  customerId: string;
  customerName: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
  editingCustomer?: Customer | null;
}

export function CustomerForm({ isOpen, onClose, onSuccess, editingCustomer }: CustomerFormProps) {
  const [customerName, setCustomerName] = useState(editingCustomer?.customerName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!editingCustomer;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const url = isEditing 
        ? `/api/customers/${editingCustomer.customerId}`
        : '/api/customers';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save customer');
      }

      const customer = await response.json();
      onSuccess(customer);
      
      // Reset form
      setCustomerName('');
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCustomerName('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-sm max-h-[90vh] overflow-auto shadow-2xl m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-base font-semibold text-slate-900 m-0">
            {isEditing ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 bg-transparent border-none rounded-md cursor-pointer transition-colors hover:bg-gray-100"
          >
            <X className="h-4.5 w-4.5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-3">
            <label 
              htmlFor="customerName"
              className="block text-xs font-medium text-gray-700 mb-1.5"
            >
              Customer Name
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
              className="w-full p-2 border border-gray-300 rounded-md text-xs outline-none transition-colors box-border focus:border-blue-600"
            />
          </div>

          {error && (
            <div className="p-2 bg-red-50 rounded-md mb-3">
              <p className="text-xs text-red-600 m-0">
                {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !customerName.trim()}
              className={`flex items-center px-3 py-1.5 text-xs font-medium text-white border-none rounded-md transition-colors ${
                isSubmitting || !customerName.trim() 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 cursor-pointer hover:bg-blue-700'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Add Customer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}