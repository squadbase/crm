'use client';

import { useClientI18n } from '@/hooks/useClientI18n';

interface StatusBadgeProps {
  status: 'paid' | 'unpaid';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useClientI18n();
  const isPaid = status === 'paid';
  
  const styles = {
    sm: {
      padding: '2px 6px',
      fontSize: '11px',
      fontWeight: '500' as const
    },
    md: {
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: '500' as const
    }
  };

  return (
    <span style={{
      ...styles[size],
      backgroundColor: isPaid ? '#dcfce7' : '#fef2f2',
      color: isPaid ? '#166534' : '#dc2626',
      border: `1px solid ${isPaid ? '#bbf7d0' : '#fecaca'}`,
      borderRadius: '6px',
      display: 'inline-flex',
      alignItems: 'center',
      lineHeight: '1'
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        backgroundColor: isPaid ? '#22c55e' : '#ef4444',
        borderRadius: '50%',
        marginRight: '4px'
      }} />
{isPaid ? t('paid') : t('unpaid')}
    </span>
  );
}

interface ServiceTypeBadgeProps {
  serviceType: 'product' | 'project';
  size?: 'sm' | 'md';
}

export function ServiceTypeBadge({ serviceType, size = 'md' }: ServiceTypeBadgeProps) {
  const { t } = useClientI18n();
  const styles = {
    sm: {
      padding: '2px 6px',
      fontSize: '11px',
      fontWeight: '500' as const
    },
    md: {
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: '500' as const
    }
  };

  const isProduct = serviceType === 'product';

  return (
    <span style={{
      ...styles[size],
      backgroundColor: isProduct ? '#eff6ff' : '#f0f9ff',
      color: isProduct ? '#1d4ed8' : '#0284c7',
      border: `1px solid ${isProduct ? '#dbeafe' : '#bae6fd'}`,
      borderRadius: '6px',
      display: 'inline-flex',
      alignItems: 'center',
      lineHeight: '1'
    }}>
{isProduct ? t('product') : t('projectType')}
    </span>
  );
}

interface PaymentTypeBadgeProps {
  paymentType: 'onetime' | 'subscription';
  size?: 'sm' | 'md';
}

export function PaymentTypeBadge({ paymentType, size = 'md' }: PaymentTypeBadgeProps) {
  const { t } = useClientI18n();
  const styles = {
    sm: {
      padding: '2px 6px',
      fontSize: '11px',
      fontWeight: '500' as const
    },
    md: {
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: '500' as const
    }
  };

  const isOnetime = paymentType === 'onetime';

  return (
    <span style={{
      ...styles[size],
      backgroundColor: isOnetime ? '#fef3c7' : '#e0e7ff',
      color: isOnetime ? '#92400e' : '#5b21b6',
      border: `1px solid ${isOnetime ? '#fde68a' : '#c7d2fe'}`,
      borderRadius: '6px',
      display: 'inline-flex',
      alignItems: 'center',
      lineHeight: '1'
    }}>
{isOnetime ? t('oneTime') : t('subscription')}
    </span>
  );
}