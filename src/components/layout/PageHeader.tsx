'use client';

import { ReactNode, useState, useEffect } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
      <div className={`flex min-h-[52px] items-center justify-between gap-4 flex-wrap ${
        isMobile ? 'px-4 py-3' : 'px-6 py-3'
      }`}>
        <div className={`flex items-start flex-col gap-0.5 min-w-0 flex-1 ${
          isMobile ? 'mr-4' : 'mr-8'
        }`}>
          <h1 className="text-base font-semibold text-slate-900 m-0 leading-6">
            {title}
          </h1>
          <p className="text-xs text-gray-500 m-0 leading-tight">
            {description}
          </p>
        </div>
        {actions && (
          <div className={`flex items-center gap-3 flex-wrap ${
            isMobile ? 'ml-2' : 'ml-4'
          }`}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}