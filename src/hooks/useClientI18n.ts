'use client';

import { useState, useEffect } from 'react';
import { translations, TranslationKey } from '@/lib/i18n';

interface Settings {
  language: 'ja' | 'en';
  currency: 'jpy' | 'usd';
}

/**
 * クライアント専用の国際化フック
 * SSRとの不整合を避けるため、APIから設定を取得
 */
export function useClientI18n() {
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState<Settings>({ language: 'en', currency: 'usd' });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsClient(true);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings({
        language: data.language === 'ja' ? 'ja' : 'en',
        currency: data.currency === 'jpy' ? 'jpy' : 'usd'
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // フォールバック値を使用
      setSettings({ language: 'en', currency: 'usd' });
    } finally {
      setIsLoading(false);
    }
  };

  // 翻訳関数
  const t = (key: TranslationKey): string => {
    if (!isClient || isLoading) {
      // SSR中やロード中はキーをそのまま返す
      return key;
    }
    return translations[key][settings.language] || translations[key]['en'] || key;
  };

  // 通貨フォーマット
  const formatCurrency = (amount: number): string => {
    if (!isClient || isLoading) {
      // SSR中はシンプルなフォーマットを返す
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

  // 日付フォーマット
  const formatDate = (date: string | Date): string => {
    if (!isClient || isLoading) {
      // SSR中はシンプルなフォーマットを返す
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString();
    }

    const locale = settings.language === 'ja' ? 'ja-JP' : 'en-US';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
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