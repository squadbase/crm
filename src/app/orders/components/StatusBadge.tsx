'use client';

import { useClientI18n } from '@/hooks/useClientI18n';

interface StatusBadgeProps {
  status: 'paid' | 'unpaid';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useClientI18n();
  const isPaid = status === 'paid';
  
  const sizeStyles = {
    sm: { padding: '2px 6px', fontSize: '12px' },
    md: { padding: '4px 8px', fontSize: '12px' }
  };

  const baseStyle = {
    fontWeight: '500',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    lineHeight: '1',
    border: '1px solid',
    ...sizeStyles[size]
  };

  const statusStyles = isPaid 
    ? {
        backgroundColor: '#f0fdf4',
        color: '#166534',
        borderColor: '#bbf7d0'
      }
    : {
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        borderColor: '#fecaca'
      };

  const dotStyle = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    marginRight: '4px',
    backgroundColor: isPaid ? '#22c55e' : '#ef4444'
  };

  return (
    <span style={{ ...baseStyle, ...statusStyles }}>
      <span style={dotStyle} />
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
  
  const sizeStyles = {
    sm: { padding: '2px 6px', fontSize: '12px' },
    md: { padding: '4px 8px', fontSize: '12px' }
  };

  const baseStyle = {
    fontWeight: '500',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    lineHeight: '1',
    border: '1px solid',
    ...sizeStyles[size]
  };

  const isProduct = serviceType === 'product';

  const statusStyles = isProduct 
    ? {
        backgroundColor: '#eff6ff',
        color: '#1e40af',
        borderColor: '#bfdbfe'
      }
    : {
        backgroundColor: '#f0f9ff',
        color: '#0369a1',
        borderColor: '#bae6fd'
      };

  return (
    <span style={{ ...baseStyle, ...statusStyles }}>
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
  
  const sizeStyles = {
    sm: { padding: '2px 6px', fontSize: '12px' },
    md: { padding: '4px 8px', fontSize: '12px' }
  };

  const baseStyle = {
    fontWeight: '500',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    lineHeight: '1',
    border: '1px solid',
    ...sizeStyles[size]
  };

  const isOnetime = paymentType === 'onetime';

  const statusStyles = isOnetime 
    ? {
        backgroundColor: '#fefce8',
        color: '#a16207',
        borderColor: '#fde047'
      }
    : {
        backgroundColor: '#eef2ff',
        color: '#4338ca',
        borderColor: '#c7d2fe'
      };

  return (
    <span style={{ ...baseStyle, ...statusStyles }}>
      {isOnetime ? t('oneTime') : t('subscription')}
    </span>
  );
}