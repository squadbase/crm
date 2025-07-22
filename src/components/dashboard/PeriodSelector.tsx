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
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Calendar size={16} color="#6b7280" />
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#0f172a',
            margin: 0
          }}>
{t('period')}
          </h3>
        </div>
      </div>

      {/* Shortcut buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setShortcutPeriod('halfYear')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
{t('sixMonthsAgo')}
        </button>
        <button
          onClick={() => setShortcutPeriod('oneYear')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
{t('oneYearAgo')}
        </button>
        <button
          onClick={() => setShortcutPeriod('all')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
{t('allTime')}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}>
        {/* Start date */}
        <div style={{ minWidth: 0 }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
{t('startDate')}
          </label>
          <input
            type="date"
            value={period.startDate}
            onChange={(e) => handlePeriodChange('startDate', e.target.value)}
            placeholder={t('dateFormatPlaceholder')}
            lang={getLanguage() === 'ja' ? 'ja' : 'en'}
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* End date */}
        <div style={{ minWidth: 0 }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
{t('endDate')}
          </label>
          <input
            type="date"
            value={period.endDate}
            onChange={(e) => handlePeriodChange('endDate', e.target.value)}
            placeholder={t('dateFormatPlaceholder')}
            lang={getLanguage() === 'ja' ? 'ja' : 'en'}
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

    </div>
  );
}