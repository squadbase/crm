'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
      <div className="flex min-h-[52px] items-center justify-between px-5 py-3 gap-3 flex-wrap">
        <div className="flex items-start flex-col gap-0.5 min-w-0 flex-1">
          <h1 className="text-lg font-semibold text-slate-900 m-0 leading-tight">
            {title}
          </h1>
          <p className="text-[13px] text-gray-500 m-0 leading-snug">
            {description}
          </p>
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}