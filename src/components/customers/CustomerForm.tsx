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
        zIndex: 50,
        padding: '16px',
        overflow: 'auto'
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '360px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 16px 0 16px'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#0f172a',
            margin: 0
          }}>
            {isEditing ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={handleClose}
            style={{
              padding: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X style={{ height: '18px', width: '18px', color: '#6b7280' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label 
              htmlFor="customerName"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}
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
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '8px',
              backgroundColor: '#fef2f2',
              borderRadius: '6px',
              marginBottom: '12px'
            }}>
              <p style={{
                fontSize: '13px',
                color: '#dc2626',
                margin: 0
              }}>
                {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !customerName.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: isSubmitting || !customerName.trim() ? '#9ca3af' : '#2563eb',
                border: 'none',
                borderRadius: '6px',
                cursor: isSubmitting || !customerName.trim() ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && customerName.trim()) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && customerName.trim()) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }
              }}
            >
              <UserPlus style={{ height: '14px', width: '14px', marginRight: '6px' }} />
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Add Customer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}