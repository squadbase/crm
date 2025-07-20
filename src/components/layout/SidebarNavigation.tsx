'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClientI18n } from '@/hooks/useClientI18n';
import { TranslationKey } from '@/lib/i18n';
import {
  Clock,
  Users,
  FileText,
  Settings,
  CreditCard,
  RefreshCw,
  Receipt
} from 'lucide-react';

const getNavigationSections = (t: (key: TranslationKey) => string) => [
  {
    title: t('salesManagementSection'),
    items: [
      { name: t('dashboard'), href: '/', icon: Clock },
      { name: t('onetimeOrders'), href: '/orders', icon: CreditCard },
      { name: t('subscriptions'), href: '/subscriptions', icon: RefreshCw },
      { name: t('customers'), href: '/customers', icon: Users },
      { name: t('unpaidPayments'), href: '/unpaid', icon: Receipt },
    ]
  },
  {
    title: t('settingsSection'),
    items: [
      { name: t('orderTemplates'), href: '/order-templates', icon: FileText },
      { name: t('settings'), href: '/settings', icon: Settings },
    ]
  }
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
  const { t, isClient, isLoading } = useClientI18n();

  // ハイドレーション中は固定の日本語表示を使用
  const getStaticNavigationSections = () => [
    {
      title: '売上管理',
      items: [
        { name: 'Dashboard', href: '/', icon: Clock },
        { name: 'Onetime Orders', href: '/orders', icon: CreditCard },
        { name: 'Subscriptions', href: '/subscriptions', icon: RefreshCw },
        { name: 'Customer Management', href: '/customers', icon: Users },
        { name: 'Unpaid Payments', href: '/unpaid', icon: Receipt },
      ]
    },
    {
      title: '設定',
      items: [
        { name: 'Order Templates', href: '/order-templates', icon: FileText },
        { name: 'Settings', href: '/settings', icon: Settings },
      ]
    }
  ];

  const navigationSections = (!isClient || isLoading)
    ? getStaticNavigationSections()
    : getNavigationSections(t);

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
          gap: '20px'
        }}>
          {navigationSections.map((section) => (
            <div key={section.title}>
              {/* Section Header */}
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
                paddingLeft: '16px'
              }}>
                {section.title}
              </div>

              {/* Section Items */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.name}
                    item={item}
                    isActive={pathname === item.href}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}