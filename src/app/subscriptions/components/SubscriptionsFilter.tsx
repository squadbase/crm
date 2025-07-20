'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface FilterValues {
  search: string;
}

interface SubscriptionsFilterProps {
  onFilterChange: (filters: FilterValues) => void;
}

export function SubscriptionsFilter({ onFilterChange }: SubscriptionsFilterProps) {
  const { t } = useClientI18n();
  const [searchValue, setSearchValue] = useState('');

  // Debounce the search input
  const debouncedFilterChange = useCallback((value: string) => {
    onFilterChange({ search: value });
  }, [onFilterChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedFilterChange(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, debouncedFilterChange]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px'
    }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
        <Search style={{ 
          position: 'absolute', 
          left: '10px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          height: '14px', 
          width: '14px', 
          color: '#6b7280' 
        }} />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t('searchKeywordsPlaceholder')}
          style={{
            width: '100%',
            paddingLeft: '32px',
            paddingRight: '10px',
            paddingTop: '6px',
            paddingBottom: '6px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#2563eb';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
        />
      </div>
      {searchValue && (
        <button
          onClick={() => setSearchValue('')}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            color: '#6b7280',
            backgroundColor: 'transparent',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {t('clear')}
        </button>
      )}
    </div>
  );
}