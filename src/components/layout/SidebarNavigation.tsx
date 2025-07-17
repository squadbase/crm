'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClientI18n } from '@/hooks/useClientI18n';
import { TranslationKey } from '@/lib/i18n';
import {
  Clock,
  Users,
  ShoppingCart,
  Settings
} from 'lucide-react';

const getNavigationItems = (t: (key: TranslationKey) => string) => [
  { name: t('dashboard'), href: '/', icon: Clock },
  { name: t('orders'), href: '/orders', icon: ShoppingCart },
  { name: t('customers'), href: '/customers', icon: Users },
  { name: t('settings'), href: '/settings', icon: Settings },
];

interface SidebarItemProps {
  item: {
    name: string;
    href: string;
    icon: React.ElementType;
  };
  isActive: boolean;
}

function SidebarItem({ item, isActive }: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        borderRadius: '6px',
        transition: 'background-color 0.2s',
        backgroundColor: isActive ? '#e5e7eb' : 'transparent',
        color: isActive ? '#111827' : '#374151',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <Icon
        size={18}
        strokeWidth={1.5}
        style={{
          flexShrink: 0,
          color: isActive ? '#111827' : '#6b7280'
        }}
      />

      <span style={{
        fontSize: '14px',
        fontWeight: 500,
        color: isActive ? '#111827' : '#374151'
      }}>
        {item.name}
      </span>
    </Link>
  );
}

export function SidebarNavigation() {
  const pathname = usePathname();
  const { t } = useClientI18n();
  const navigationItems = getNavigationItems(t);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'white',
      width: '260px',
      borderRight: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#0f172a',
          margin: 0,
          letterSpacing: '-0.025em',
          textAlign: 'center'
        }}>
          Squadbase CRM
        </h1>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 12px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.name}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}