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
    <div style={{
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        minHeight: '52px',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '12px 16px' : '12px 24px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'column',
          gap: '2px',
          minWidth: 0,
          flex: 1,
          marginRight: isMobile ? '16px' : '32px'
        }}>
          <h1 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#0f172a',
            margin: 0,
            lineHeight: '1.5'
          }}>
            {title}
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#6b7280',
            margin: 0,
            lineHeight: '1.4'
          }}>
            {description}
          </p>
        </div>
        {actions && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginLeft: isMobile ? '8px' : '16px'
          }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}