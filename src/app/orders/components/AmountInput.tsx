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

  // 数値をカンマ区切りにフォーマット
  const formatNumber = (num: string) => {
    const numericValue = num.replace(/[^\d]/g, '');
    if (numericValue === '') return '';
    return Number(numericValue).toLocaleString();
  };

  // カンマ区切りから数値文字列に変換
  const parseNumber = (formatted: string) => {
    return formatted.replace(/,/g, '');
  };

  // 初期化時とvalue変更時に表示値を更新
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // 数字とカンマのみ許可
    const numericValue = inputValue.replace(/[^\d,]/g, '');
    
    // カンマを削除して純粋な数値文字列を取得
    const pureNumeric = parseNumber(numericValue);
    
    // 表示値を更新（フォーカス中はカンマなし、フォーカス外ではカンマあり）
    if (isFocused) {
      setDisplayValue(pureNumeric);
    } else {
      setDisplayValue(formatNumber(pureNumeric));
    }
    
    // 親コンポーネントに純粋な数値文字列を送信
    onChange(pureNumeric);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // フォーカス時はカンマを削除
    setDisplayValue(parseNumber(displayValue));
  };

  const handleBlur = () => {
    setIsFocused(false);
    // フォーカスアウト時はカンマを追加
    setDisplayValue(formatNumber(value));
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* 通貨記号を数字の前に表示 */}
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
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '8px 12px',
          paddingLeft: '30px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: 'white',
          boxSizing: 'border-box',
          ...style
        }}
      />
    </div>
  );
}