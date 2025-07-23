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
      className={`
        flex items-center gap-2 px-4 py-2 rounded-md transition-colors no-underline
        ${isActive
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      <Icon
        size={18}
        strokeWidth={1.5}
        className={`shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-500'}`}
      />

      <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
        {item.name}
      </span>
    </Link>
  );
}

export function SidebarNavigation() {
  const pathname = usePathname();
  const { t, isClient, isLoading } = useClientI18n();

  // Use fixed display during hydration
  const getStaticNavigationSections = () => [
    {
      title: 'Sales Management',
      items: [
        { name: 'Dashboard', href: '/', icon: Clock },
        { name: 'Onetime Orders', href: '/orders', icon: CreditCard },
        { name: 'Subscriptions', href: '/subscriptions', icon: RefreshCw },
        { name: 'Customers', href: '/customers', icon: Users },
        { name: 'Unpaid Payments', href: '/unpaid', icon: Receipt },
      ]
    },
    {
      title: 'Settings',
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
    <div className="flex flex-col h-screen bg-white w-64 border-r border-gray-200">
      {/* Header */}
      <div className="px-4 py-5 border-b border-gray-200">
        <h1 className="text-base font-bold text-slate-900 m-0 tracking-tight text-center">
          Squadbase CRM
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-5">
          {navigationSections.map((section, sectionIndex) => (
            <div key={`section-${sectionIndex}`}>
              {/* Section Header */}
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 pl-4">
                {section.title}
              </div>

              {/* Section Items */}
              <div className="flex flex-col gap-1">
                {section.items.map((item, itemIndex) => (
                  <SidebarItem
                    key={`item-${item.href}-${itemIndex}`}
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