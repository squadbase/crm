'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface FilterValues {
  paymentType: string;
  serviceType: string;
  isActive: string;
  search: string;
}

interface TemplateFilterProps {
  onFilterChange: (filters: FilterValues) => void;
}

export function TemplateFilter({ onFilterChange }: TemplateFilterProps) {
  const [filters, setFilters] = useState<FilterValues>({
    paymentType: '',
    serviceType: '',
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
      serviceType: '',
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
      borderRadius: '12px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
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
          フィルター・検索
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        alignItems: 'end'
      }}>
        {/* 多言語検索ボックス */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            テンプレート検索
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
              placeholder="テンプレート名や説明で検索 (日本語・English)"
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

        {/* サービス種別フィルター */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            サービス種別
          </label>
          <select
            value={filters.serviceType}
            onChange={(e) => handleFilterUpdate('serviceType', e.target.value)}
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
            <option value="">すべて</option>
            <option value="product">プロダクト</option>
            <option value="project">プロジェクト</option>
          </select>
        </div>

        {/* 支払い形態フィルター */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            支払い形態
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
            <option value="">すべて</option>
            <option value="onetime">一回払い</option>
            <option value="subscription">サブスクリプション</option>
          </select>
        </div>

        {/* アクティブ状態フィルター */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            ステータス
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
            <option value="">すべて</option>
            <option value="true">アクティブ</option>
            <option value="false">非アクティブ</option>
          </select>
        </div>

        {/* クリアボタン */}
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
            クリア
          </button>
        </div>
      </div>
    </div>
  );
}