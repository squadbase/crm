'use client';

import { useState, useEffect } from 'react';
import { useClientI18n } from '@/hooks/useClientI18n';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  style?: React.CSSProperties;
}

export function AmountInput({ 
  value, 
  onChange, 
  placeholder = '0',
  required = false,
  style = {}
}: AmountInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { getCurrencySymbol, isLoading } = useClientI18n();

  // Format number with comma separators
  const formatNumber = (num: string) => {
    const numericValue = num.replace(/[^\d]/g, '');
    if (numericValue === '') return '';
    return Number(numericValue).toLocaleString();
  };

  // Convert from comma-separated to numeric string
  const parseNumber = (formatted: string) => {
    return formatted.replace(/,/g, '');
  };

  // Update display value on initialization and value changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow only digits and commas
    const numericValue = inputValue.replace(/[^\d,]/g, '');
    
    // Remove commas to get pure numeric string
    const pureNumeric = parseNumber(numericValue);
    
    // Update display value (no comma when focused, with comma when not focused)
    if (isFocused) {
      setDisplayValue(pureNumeric);
    } else {
      setDisplayValue(formatNumber(pureNumeric));
    }
    
    // Send pure numeric string to parent component
    onChange(pureNumeric);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Remove commas when focused
    setDisplayValue(parseNumber(displayValue));
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Add commas when focus is lost
    setDisplayValue(formatNumber(value));
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Display currency symbol before the number */}
      <div style={{
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '14px',
        color: '#6b7280',
        pointerEvents: 'none'
      }}>
        {isLoading ? '¥' : getCurrencySymbol()}
      </div>
      
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={(e) => {
          handleFocus();
          e.currentTarget.style.borderColor = '#2563eb';
          e.currentTarget.style.boxShadow = '0 0 0 1px #2563eb';
        }}
        onBlur={(e) => {
          handleBlur();
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.boxShadow = 'none';
        }}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '8px 12px',
          paddingLeft: '28px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: 'white',
          boxSizing: 'border-box',
          outline: 'none',
          ...style
        }}
      />
    </div>
  );
}