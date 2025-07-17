import './globals.css'
import { SidebarLayout } from '@/components/layout/SidebarLayout'
import { ContentLayout } from '@/components/layout/ContentLayout'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
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