'use client';

import { useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useClientI18n } from '@/hooks/useClientI18n';
import { Settings, Globe, DollarSign } from 'lucide-react';

export default function SettingsPage() {
  const { t, settings, isLoading } = useClientI18n();
  
  // Page title setup
  useEffect(() => {
    document.title = t('settingsTitle');
  }, [t]);

  const languageDisplay = {
    ja: t('japanese'),
    en: t('english'),
    es: t('spanish'),
    fr: t('french'),
    zh: t('chinese'),
    ko: t('korean')
  };

  const currencyDisplay = {
    jpy: t('yen'),
    usd: t('dollar'),
    eur: t('euro'),
    cny: t('yuan'),
    krw: t('won')
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader
          title={t('settings')}
          description={t('settingsDescription')}
          actions={null}
        />
        <div className="p-4 flex justify-center items-center h-[200px]">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title={t('settings')}
        description={t('settingsDescription')}
        actions={null}
      />

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-5 max-w-[800px]">

          {/* Language Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  {t('languageSettings')}
                </h3>
                <p className="text-sm text-gray-500 m-0">
                  {t('systemDisplayLanguage')}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 font-medium">
                  {t('currentSettings')}:
                </span>
                <span className="text-sm text-slate-900 font-semibold">
                  {languageDisplay[settings.language]}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {t('environmentVariable')}: LANGUAGE={settings.language}
              </div>
            </div>
          </div>

          {/* Currency Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  {t('currencySettings')}
                </h3>
                <p className="text-sm text-gray-500 m-0">
                  {t('currencyDisplayUnit')}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 font-medium">
                  {t('currentSettings')}:
                </span>
                <span className="text-sm text-slate-900 font-semibold">
                  {currencyDisplay[settings.currency]}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {t('environmentVariable')}: CURRENCY={settings.currency}
              </div>
            </div>
          </div>

        </div>

        {/* Settings Change Instructions */}
        <div className="mt-8 p-5 bg-amber-100 border border-amber-500 rounded-lg max-w-[800px]">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">
              {t('settingsChangeInfo')}
            </span>
          </div>
          <p className="text-sm text-amber-800 mb-2 leading-relaxed">
            {t('settingsChangeDescription')}
          </p>
          <div className="bg-amber-50 p-3 rounded border border-amber-400 font-mono text-xs text-amber-800">
            LANGUAGE=en # en, ja<br/>
            CURRENCY=usd # usd, jpy
          </div>
          <p className="text-xs text-amber-800 mt-2">
            {t('restartRequired')}
          </p>
        </div>
      </div>
    </div>
  );
}