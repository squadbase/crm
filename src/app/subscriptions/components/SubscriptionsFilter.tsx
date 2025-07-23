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
    <div className="flex items-center gap-3 mb-4">
      <div className="relative w-full max-w-80">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t('searchKeywordsPlaceholder')}
          className="w-full pl-8 pr-2.5 py-1.5 border border-gray-300 rounded-md text-sm outline-none transition-colors focus:border-blue-600"
        />
      </div>
      {searchValue && (
        <button
          onClick={() => setSearchValue('')}
          className="px-3 py-1.5 text-sm text-gray-500 bg-transparent border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
        >
          {t('clear')}
        </button>
      )}
    </div>
  );
}