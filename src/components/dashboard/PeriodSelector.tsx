'use client';

import { useState, useEffect } from 'react';
import { Calendar, Calculator } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';
import { 
  canExecuteCalculation, 
  getRemainingCooldownMinutes, 
  markCalculationExecuted,
  getLastExecutionTime,
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
  const [isCalculating, setIsCalculating] = useState(false);
  const [remainingCooldown, setRemainingCooldown] = useState(0);
  const [lastCalculationTime, setLastCalculationTime] = useState<Date | null>(null);

  // 初期値として半年を設定
  useEffect(() => {
    setShortcutPeriod('halfYear');
    // 初期計算状態を更新
    updateCalculationStatus();
    
    // 15分以上経過していたら自動実行
    if (canExecuteCalculation()) {
      console.log('Auto-executing monthly calculation on dashboard load...');
      executeMonthlyCalculationSilently();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1分ごとにクールダウン状態を更新
  useEffect(() => {
    const interval = setInterval(updateCalculationStatus, 60000); // 1分ごと
    return () => clearInterval(interval);
  }, []);

  const updateCalculationStatus = () => {
    setRemainingCooldown(getRemainingCooldownMinutes());
    setLastCalculationTime(getLastExecutionTime());
  };

  const handlePeriodChange = (key: keyof PeriodValues, value: string) => {
    const newPeriod = { ...period, [key]: value };
    setPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  // サイレント実行用（アラートなし） - 常に過去半年分を実行
  const executeMonthlyCalculationSilently = async () => {
    if (!canExecuteCalculation()) {
      return;
    }

    setIsCalculating(true);
    setCalculationExecuting(true);
    
    try {
      // 過去半年の期間を計算
      const now = new Date();
      const endYear = now.getFullYear();
      const endMonth = now.getMonth() + 1;
      
      // 6ヶ月前を計算
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
        console.log('Auto period calculation completed for past 6 months:', result.data);
      } else {
        console.error('Auto period calculation failed:', result);
      }
    } catch (error) {
      console.error('Failed to execute auto period calculation:', error);
    } finally {
      setIsCalculating(false);
      setCalculationExecuting(false);
    }
  };

  // 期間での月額計算を実行
  const executeMonthlyCalculation = async () => {
    if (!canExecuteCalculation() || !period.startDate || !period.endDate) {
      return;
    }

    setIsCalculating(true);
    setCalculationExecuting(true);
    
    try {
      // 期間をyear/monthに変換
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;

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
        console.log('Period calculation completed:', result.data);
        alert(t('calculationCompleted'));
      } else {
        console.error('Period calculation failed:', result);
        alert(`${t('calculationFailed')} ${result.error || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('Failed to execute period calculation:', error);
      alert(`${t('calculationFailed')} ${error.message || '不明なエラー'}`);
    } finally {
      setIsCalculating(false);
      setCalculationExecuting(false);
    }
  };

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

    // 日本時間での日付計算を行う
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (shortcut) {
      case 'halfYear':
        // 半年前から半年後まで
        startDate = new Date(year, month - 6, 1);
        endDate = new Date(year, month + 6, 0); // 6ヶ月後の月末
        break;
      case 'oneYear':
        // 1年前から半年後まで
        startDate = new Date(year - 1, month, 1);
        endDate = new Date(year, month + 6, 0); // 6ヶ月後の月末
        break;
      case 'all':
        // 過去全てから半年後まで
        startDate = new Date(2020, 0, 1); // 2020年1月1日から開始
        endDate = new Date(year, month + 6, 0); // 6ヶ月後の月末
        break;
    }

    // ローカル時間での日付文字列を作成
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

      {/* ショートカットボタン */}
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
        {/* 開始日 */}
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

        {/* 終了日 */}
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