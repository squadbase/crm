'use client';

import './globals.css'
import { SidebarLayout } from '@/components/layout/SidebarLayout'
import { ContentLayout } from '@/components/layout/ContentLayout'
import { useClientI18n } from '@/hooks/useClientI18n'
import { useEffect } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { getLanguage } = useClientI18n();
  const language = getLanguage();
  
  useEffect(() => {
    // HTMLのlang属性を動的に設定
    document.documentElement.lang = language;
  }, [language]);

  return (
    <html lang={language}>
      <body className="antialiased">
        <SidebarLayout>
          <ContentLayout>
            {children}
          </ContentLayout>
        </SidebarLayout>
      </body>
    </html>
  )
}