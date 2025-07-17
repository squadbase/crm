'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search customers..." }: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
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
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
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
  );
}