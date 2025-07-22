'use client';

import './globals.css'
import { SidebarLayout } from '@/components/layout/SidebarLayout'
import { ContentLayout } from '@/components/layout/ContentLayout'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { useClientI18n } from '@/hooks/useClientI18n'
import { useEffect } from 'react'

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { getLanguage } = useClientI18n();
  const language = getLanguage();
  
  useEffect(() => {
    // Dynamically set HTML lang attribute
    document.documentElement.lang = language;
  }, [language]);

  return (
    <SidebarLayout>
      <ContentLayout>
        {children}
      </ContentLayout>
    </SidebarLayout>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body className="antialiased">
        <SettingsProvider>
          <RootLayoutContent>
            {children}
          </RootLayoutContent>
        </SettingsProvider>
      </body>
    </html>
  )
}