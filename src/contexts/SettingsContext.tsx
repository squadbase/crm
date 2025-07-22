'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  language: 'ja' | 'en';
  currency: 'jpy' | 'usd';
}

interface SettingsContextType {
  settings: Settings;
  isLoading: boolean;
  isClient: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
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

  return (
    <SettingsContext.Provider value={{ settings, isLoading, isClient }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}