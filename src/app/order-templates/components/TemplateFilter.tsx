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
    <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={18} className="text-gray-500" />
        <h3 className="text-sm font-medium text-gray-700 m-0">
          Filter & Search
        </h3>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 items-end">
        {/* Multilingual search box */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Template Search
          </label>
          <div className="relative">
            <Search 
              size={16} 
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by template name or description (Japanese・English)"
              value={filters.search}
              onChange={(e) => handleFilterUpdate('search', e.target.value)}
              className="w-full py-2 pr-2 pl-8 border border-gray-300 rounded text-sm outline-none transition-colors duration-200 focus:border-blue-600"
            />
          </div>
        </div>


        {/* Payment type filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Payment Type
          </label>
          <select
            value={filters.paymentType}
            onChange={(e) => handleFilterUpdate('paymentType', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm bg-white outline-none cursor-pointer"
          >
            <option value="">All</option>
            <option value="onetime">One-time Payment</option>
            <option value="subscription">Subscription</option>
          </select>
        </div>

        {/* Active status filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.isActive}
            onChange={(e) => handleFilterUpdate('isActive', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm bg-white outline-none cursor-pointer"
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded cursor-pointer transition-colors duration-200 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}