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
    en: t('english')
  };

  const currencyDisplay = {
    jpy: t('yen'),
    usd: t('dollar')
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        <PageHeader
          title={t('settings')}
          description={t('settingsDescription')}
          actions={null}
        />
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <PageHeader
        title={t('settings')}
        description={t('settingsDescription')}
        actions={null}
      />

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          maxWidth: '800px'
        }}>

          {/* Language Settings */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                height: '40px',
                width: '40px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Globe style={{ height: '20px', width: '20px', color: '#2563eb' }} />
              </div>
              <div>
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0 0 4px 0'
                }}>
{t('languageSettings')}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
{t('systemDisplayLanguage')}
                </p>
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '500'
                }}>
{t('currentSettings')}:
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#0f172a',
                  fontWeight: '600'
                }}>
                  {languageDisplay[settings.language]}
                </span>
              </div>
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#6b7280'
              }}>
{t('environmentVariable')}: LANGUAGE={settings.language}
              </div>
            </div>
          </div>

          {/* Currency Settings */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                height: '40px',
                width: '40px',
                backgroundColor: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign style={{ height: '20px', width: '20px', color: '#16a34a' }} />
              </div>
              <div>
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0 0 4px 0'
                }}>
{t('currencySettings')}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
{t('currencyDisplayUnit')}
                </p>
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '500'
                }}>
{t('currentSettings')}:
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#0f172a',
                  fontWeight: '600'
                }}>
                  {currencyDisplay[settings.currency]}
                </span>
              </div>
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#6b7280'
              }}>
{t('environmentVariable')}: CURRENCY={settings.currency}
              </div>
            </div>
          </div>

        </div>

        {/* Settings Change Instructions */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          maxWidth: '800px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <Settings style={{ height: '16px', width: '16px', color: '#d97706' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#92400e'
            }}>
{t('settingsChangeInfo')}
            </span>
          </div>
          <p style={{
            fontSize: '13px',
            color: '#92400e',
            margin: '0 0 8px 0',
            lineHeight: '1.5'
          }}>
{t('settingsChangeDescription')}
          </p>
          <div style={{
            backgroundColor: '#fffbeb',
            padding: '12px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#92400e',
            border: '1px solid #fbbf24'
          }}>
            LANGUAGE=en # en, ja<br/>
            CURRENCY=usd # usd, jpy
          </div>
          <p style={{
            fontSize: '12px',
            color: '#92400e',
            margin: '8px 0 0 0'
          }}>
{t('restartRequired')}
          </p>
        </div>
      </div>
    </div>
  );
}