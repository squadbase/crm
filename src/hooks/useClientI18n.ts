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
    const translation = translations[key] as Record<string, string>;
    if (!isClient || isLoading) {
      // Return configured default language during SSR or loading (avoiding placeholders)
      return translation[settings.language] || translation['en'] || key;
    }
    return translation[settings.language] || translation['en'] || key;
  };

  // Currency formatting
  const formatCurrency = (amount: number): string => {
    if (!isClient || isLoading) {
      // Return simple format during SSR
      return `$${amount.toLocaleString()}`;
    }

    // Map currency codes
    const currencyMap: Record<string, string> = {
      usd: 'USD',
      jpy: 'JPY',
      eur: 'EUR',
      cny: 'CNY',
      krw: 'KRW',
    };

    // Map languages to locales
    const localeMap: Record<string, string> = {
      en: 'en-US',
      ja: 'ja-JP',
      es: 'es-ES',
      fr: 'fr-FR',
      zh: 'zh-CN',
      ko: 'ko-KR',
    };

    const currency = currencyMap[settings.currency] || 'USD';
    const locale = localeMap[settings.language] || 'en-US';

    // Currencies that don't use decimal places
    const noDecimalCurrencies = ['JPY', 'KRW', 'CNY'];

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: noDecimalCurrencies.includes(currency) ? 0 : 2,
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
  const getCurrency = () => {
    const currencyMap: Record<string, string> = {
      jpy: 'JPY',
      usd: 'USD',
      eur: 'EUR',
      cny: 'CNY',
      krw: 'KRW',
    };
    return currencyMap[settings.currency] || 'USD';
  };
  const getCurrencySymbol = () => {
    const symbolMap: Record<string, string> = {
      jpy: '¥',
      usd: '$',
      eur: '€',
      cny: '¥',
      krw: '₩',
    };
    return symbolMap[settings.currency] || '$';
  };

  return {
    t,
    formatCurrency,
    formatDate,
    getLanguage,
    getCurrency,
    getCurrencySymbol,
    isClient,
    isLoading,
    settings,
  };
}
