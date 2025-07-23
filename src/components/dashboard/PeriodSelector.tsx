'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';
import { 
  canExecuteCalculation, 
  markCalculationExecuted,
  setCalculationExecuting
} from '@/lib/calculation-cooldown';

interface PeriodValues {
  startDate: string;
  endDate: string;
}

interface PeriodSelectorProps {
  onPeriodChange: (period: PeriodValues) => void;
}

export function PeriodSelector({ onPeriodChange }: PeriodSelectorProps) {
  const { t, getLanguage } = useClientI18n();
  const [period, setPeriod] = useState<PeriodValues>({
    startDate: '',
    endDate: ''
  });
  // Removed unused state variables for calculation status

  // Set half year as initial value
  useEffect(() => {
    setShortcutPeriod('halfYear');
    // Update initial calculation status
    updateCalculationStatus();
    
    // Auto-execute if more than 15 minutes have passed
    if (canExecuteCalculation()) {
      executeMonthlyCalculationSilently();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update cooldown status every minute
  useEffect(() => {
    const interval = setInterval(updateCalculationStatus, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  const updateCalculationStatus = () => {
    // Cooldown status tracking removed
  };

  const handlePeriodChange = (key: keyof PeriodValues, value: string) => {
    const newPeriod = { ...period, [key]: value };
    setPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  // For silent execution (no alerts) - always execute for past six months
  const executeMonthlyCalculationSilently = async () => {
    if (!canExecuteCalculation()) {
      return;
    }

    // Calculation state tracking removed
    setCalculationExecuting(true);
    
    try {
      // Calculate period for past six months
      const now = new Date();
      const endYear = now.getFullYear();
      const endMonth = now.getMonth() + 1;
      
      // Calculate six months ago
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const startYear = sixMonthsAgo.getFullYear();
      const startMonth = sixMonthsAgo.getMonth() + 1;

      const response = await fetch('/api/subscriptions/calculate-monthly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startYear,
          startMonth,
          endYear,
          endMonth
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        markCalculationExecuted();
        updateCalculationStatus();
      }
    } catch {
      // Auto calculation failed silently
    } finally {
      // Calculation state tracking removed
      setCalculationExecuting(false);
    }
  };

  // executeMonthlyCalculation function removed as it was unused

  // const clearPeriod = () => { // Currently not used
  //   const clearedPeriod: PeriodValues = {
  //     startDate: '',
  //     endDate: ''
  //   };
  //   setPeriod(clearedPeriod);
  //   onPeriodChange(clearedPeriod);
  // };

  const setShortcutPeriod = (shortcut: 'halfYear' | 'oneYear' | 'all') => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    // Perform date calculations in Japan time
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (shortcut) {
      case 'halfYear':
        // From six months ago to six months later
        startDate = new Date(year, month - 6, 1);
        endDate = new Date(year, month + 6, 0); // End of month 6 months later
        break;
      case 'oneYear':
        // From one year ago to six months later
        startDate = new Date(year - 1, month, 1);
        endDate = new Date(year, month + 6, 0); // End of month 6 months later
        break;
      case 'all':
        // From all past to six months later
        startDate = new Date(2020, 0, 1); // Start from January 1, 2020
        endDate = new Date(year, month + 6, 0); // End of month 6 months later
        break;
    }

    // Create date strings in local time
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const newPeriod: PeriodValues = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
    setPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <h3 className="text-base font-semibold text-slate-900 m-0">
            {t('period')}
          </h3>
        </div>
      </div>

      {/* Shortcut buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setShortcutPeriod('halfYear')}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
        >
          {t('sixMonthsAgo')}
        </button>
        <button
          onClick={() => setShortcutPeriod('oneYear')}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
        >
          {t('oneYearAgo')}
        </button>
        <button
          onClick={() => setShortcutPeriod('all')}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
        >
          {t('allTime')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Start date */}
        <div className="min-w-0">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            {t('startDate')}
          </label>
          <input
            type="date"
            value={period.startDate}
            onChange={(e) => handlePeriodChange('startDate', e.target.value)}
            placeholder={t('dateFormatPlaceholder')}
            lang={getLanguage() === 'ja' ? 'ja' : 'en'}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-xs box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* End date */}
        <div className="min-w-0">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            {t('endDate')}
          </label>
          <input
            type="date"
            value={period.endDate}
            onChange={(e) => handlePeriodChange('endDate', e.target.value)}
            placeholder={t('dateFormatPlaceholder')}
            lang={getLanguage() === 'ja' ? 'ja' : 'en'}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-xs box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

    </div>
  );
}