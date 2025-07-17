'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useClientI18n } from '@/hooks/useClientI18n';

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

  // 初期値として半年を設定
  useEffect(() => {
    setShortcutPeriod('halfYear');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePeriodChange = (key: keyof PeriodValues, value: string) => {
    const newPeriod = { ...period, [key]: value };
    setPeriod(newPeriod);
    onPeriodChange(newPeriod);
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
    const day = now.getDate();

    switch (shortcut) {
      case 'halfYear':
        startDate = new Date(year, month - 6, 1);
        endDate = new Date(year, month, day);
        break;
      case 'oneYear':
        startDate = new Date(year - 1, month, 1);
        endDate = new Date(year, month, day);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1); // 2020年1月1日から開始
        endDate = new Date(year, month, day);
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
{t('halfYear')}
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
{t('oneYear')}
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
{t('allPeriod')}
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