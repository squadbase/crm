'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  language: 'ja' | 'en' | 'es' | 'fr' | 'zh' | 'ko';
  currency: 'jpy' | 'usd' | 'eur' | 'cny' | 'krw';
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
      const validLanguages = ['ja', 'en', 'es', 'fr', 'zh', 'ko'];
      const validCurrencies = ['jpy', 'usd', 'eur', 'cny', 'krw'];
      
      setSettings({
        language: validLanguages.includes(data.language) ? data.language : 'en',
        currency: validCurrencies.includes(data.currency) ? data.currency : 'usd'
      });
    } catch {
      // Use fallback values
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