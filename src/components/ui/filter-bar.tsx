'use client';

import { type ReactNode, useState } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Input } from './input';
import { X, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClientI18n } from '@/hooks/useClientI18n';

interface FilterItem {
  id: string;
  label: string;
  value: string;
  color?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'accent' | 'outline';
}

interface FilterBarProps {
  placeholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterItem[];
  onFilterRemove?: (filterId: string) => void;
  onFiltersClear?: () => void;
  sortOptions?: Array<{
    id: string;
    label: string;
    value: 'asc' | 'desc';
  }>;
  currentSort?: string;
  onSortChange?: (sortId: string) => void;
  children?: ReactNode;
  className?: string;
}

export function FilterBar({
  placeholder,
  searchValue = "",
  onSearchChange,
  filters = [],
  onFilterRemove,
  onFiltersClear,
  sortOptions = [],
  currentSort,
  onSortChange,
  children,
  className = ""
}: FilterBarProps) {
  const { t } = useClientI18n();
  const [isExpanded, setIsExpanded] = useState(false);

  // Use translation key as default placeholder
  const displayPlaceholder = placeholder || t('searchPlaceholderDefault');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Filter Bar */}
      <div className="flex items-center gap-4 p-4 bg-white border border-line rounded-lg">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={displayPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        {/* Filter Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {t('filterButton')}
          </Button>

          {/* Sort Options */}
          {sortOptions.length > 0 && (
            <div className="flex items-center gap-1">
              {sortOptions.map((option, index) => (
                <Button
                  key={`sort-${option.id}-${index}`}
                  variant={currentSort === option.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSortChange?.(option.id)}
                  className="gap-1"
                >
                  {option.value === 'asc' ? (
                    <SortAsc className="h-3 w-3" />
                  ) : (
                    <SortDesc className="h-3 w-3" />
                  )}
                  {option.label}
                </Button>
              ))}
            </div>
          )}

          {children}
        </div>
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="flex items-center gap-2 px-4">
          <span className="text-small text-muted-foreground">{t('activeFilters')}</span>
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((filter, index) => (
              <Badge
                key={`filter-${filter.id}-${index}`}
                variant={filter.color || 'secondary'}
                className="gap-1"
              >
                {filter.label}: {filter.value}
                <button
                  onClick={() => onFilterRemove?.(filter.id)}
                  className="hover:bg-white/20 rounded-full p-0.5 ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filters.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onFiltersClear}
                className="text-muted-foreground hover:text-foreground"
              >
                {t('clearAllFilters')}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="p-4 bg-muted/50 border border-line rounded-lg">
          <div className="space-y-4">
            <h4 className="text-subheading font-medium">{t('detailedFilters')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* This would be populated with specific filter controls */}
              <div className="text-small text-muted-foreground">
                {t('addFilterOptions')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { FilterItem, FilterBarProps };