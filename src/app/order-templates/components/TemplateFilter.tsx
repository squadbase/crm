'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface FilterValues {
  paymentType: string;
  isActive: string;
  search: string;
}

interface TemplateFilterProps {
  onFilterChange: (filters: FilterValues) => void;
}

export function TemplateFilter({ onFilterChange }: TemplateFilterProps) {
  const [filters, setFilters] = useState<FilterValues>({
    paymentType: '',
    isActive: '',
    search: ''
  });

  const handleFilterUpdate = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      paymentType: '',
      isActive: '',
      search: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div style={{
      padding: '16px',
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <Filter size={18} style={{ color: '#6b7280' }} />
        <h3 style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          margin: 0
        }}>
          Filter & Search
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        alignItems: 'end'
      }}>
        {/* Multilingual search box */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Template Search
          </label>
          <div style={{ position: 'relative' }}>
            <Search 
              size={16} 
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }}
            />
            <input
              type="text"
              placeholder="Search by template name or description (Japanese・English)"
              value={filters.search}
              onChange={(e) => handleFilterUpdate('search', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 8px 8px 32px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
              }}
            />
          </div>
        </div>


        {/* Payment type filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Payment Type
          </label>
          <select
            value={filters.paymentType}
            onChange={(e) => handleFilterUpdate('paymentType', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All</option>
            <option value="onetime">One-time Payment</option>
            <option value="subscription">Subscription</option>
          </select>
        </div>

        {/* Active status filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Status
          </label>
          <select
            value={filters.isActive}
            onChange={(e) => handleFilterUpdate('isActive', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Clear button */}
        <div>
          <button
            onClick={clearFilters}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
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
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}