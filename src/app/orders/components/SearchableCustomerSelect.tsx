'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface Customer {
  customerId: string;
  customerName: string;
}

interface SearchableCustomerSelectProps {
  customers: Customer[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function SearchableCustomerSelect({
  customers,
  value,
  onChange,
  placeholder,
  required = false
}: SearchableCustomerSelectProps) {
  const { t } = useClientI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(customers);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use translation key as default placeholder
  const displayPlaceholder = placeholder || t('selectCustomerPlaceholder');

  // Filter customers based on search criteria
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get selected customer name
  const selectedCustomer = customers.find(c => c.customerId === value);
  const displayValue = selectedCustomer ? selectedCustomer.customerName : '';

  const handleSelect = (customerId: string) => {
    onChange(customerId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          backgroundColor: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          minHeight: '40px',
          transition: 'border-color 0.2s',
          borderColor: isOpen ? '#2563eb' : '#d1d5db'
        }}
      >
        <span style={{
          color: displayValue ? '#0f172a' : '#9ca3af',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {displayValue || displayPlaceholder}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {displayValue && (
            <button
              onClick={handleClear}
              style={{
                padding: '2px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X size={14} color="#6b7280" />
            </button>
          )}
          <ChevronDown
            size={16}
            color="#6b7280"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          />
        </div>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 1000,
          marginTop: '4px',
          maxHeight: '200px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '8px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#f9fafb'
            }}>
              <Search size={14} color="#6b7280" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchByCustomerName')}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  fontSize: '14px',
                  flex: 1,
                  color: '#0f172a'
                }}
              />
            </div>
          </div>

          <div style={{
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer, index) => (
                <div
                  key={`customer-${customer.customerId}-${index}`}
                  onClick={() => handleSelect(customer.customerId)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#0f172a',
                    backgroundColor: value === customer.customerId ? '#eff6ff' : 'white',
                    borderLeft: value === customer.customerId ? '3px solid #2563eb' : '3px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (value !== customer.customerId) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== customer.customerId) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  {customer.customerName}
                </div>
              ))
            ) : (
              <div style={{
                padding: '12px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {t('noMatchingCustomers')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* hidden input for form validation */}
      {required && (
        <input
          type="hidden"
          value={value}
          required={required}
        />
      )}
    </div>
  );
}