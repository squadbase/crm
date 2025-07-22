'use client';

import { translations, TranslationKey } from '@/lib/i18n';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * Client-only internationalization hook
 * Uses shared settings from SettingsContext
 */
export function useClientI18n() {
  const { settings, isLoading, isClient } = useSettings();

  // Translation function
  const t = (key: TranslationKey): string => {
    if (!isClient || isLoading) {
      // Return configured default language during SSR or loading (avoiding placeholders)
      return translations[key][settings.language] || translations[key]['en'] || key;
    }
    return translations[key][settings.language] || translations[key]['en'] || key;
  };

  // Currency formatting
  const formatCurrency = (amount: number): string => {
    if (!isClient || isLoading) {
      // Return simple format during SSR
      return `¥${amount.toLocaleString()}`;
    }

    const currency = settings.currency === 'jpy' ? 'JPY' : 'USD';
    const locale = settings.language === 'ja' ? 'ja-JP' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(amount);
  };

  // Date formatting - yyyy/MM/dd format
  const formatDate = (date: string | Date | null | undefined): string => {
    // Return "-" if date is undefined or null
    if (!date) {
      return '-';
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Return "-" if date is invalid
    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}/${month}/${day}`;
  };

  const getLanguage = () => settings.language;
  const getCurrency = () => settings.currency === 'jpy' ? 'JPY' : 'USD';
  const getCurrencySymbol = () => settings.currency === 'jpy' ? '¥' : '$';

  return {
    t,
    formatCurrency,
    formatDate,
    getLanguage,
    getCurrency,
    getCurrencySymbol,
    isClient,
    isLoading,
    settings
  };
}