'use client';

import { type ReactNode } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
  className = ""
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-white border-b border-line pb-6 ${className}`}
    >
      <div className="space-y-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-small">
            {breadcrumbs.map((item, index) => (
              <div key={`breadcrumb-${index}`} className="flex items-center space-x-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <span
                  className={
                    index === breadcrumbs.length - 1
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground cursor-pointer"
                  }
                >
                  {item.label}
                </span>
              </div>
            ))}
          </nav>
        )}
        
        {/* Title and Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-display font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-body text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
        
        {/* Additional Content */}
        {children && (
          <div className="space-y-4">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface PageHeaderActionsProps {
  children: ReactNode;
  className?: string;
}

export function PageHeaderActions({ children, className = "" }: PageHeaderActionsProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {children}
    </div>
  );
}

interface PageHeaderSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function PageHeaderSearch({
  placeholder = "Search...",
  value,
  onChange,
  className = ""
}: PageHeaderSearchProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="pl-10 w-80"
      />
    </div>
  );
}

interface PageHeaderStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  }>;
  className?: string;
}

export function PageHeaderStats({ stats, className = "" }: PageHeaderStatsProps) {
  return (
    <div className={`flex items-center gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <div key={`stat-${index}`} className="flex items-center gap-2">
          <span className="text-small text-muted-foreground">{stat.label}</span>
          <Badge 
            variant={stat.color === 'primary' ? 'default' : 'secondary'}
            className={
              stat.color === 'success' ? 'bg-success text-white' :
              stat.color === 'warning' ? 'bg-warning text-white' :
              stat.color === 'danger' ? 'bg-danger text-white' :
              stat.color === 'accent' ? 'bg-accent text-white' :
              ''
            }
          >
            {stat.value}
          </Badge>
        </div>
      ))}
    </div>
  );
}