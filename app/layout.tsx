import type { Metadata, Viewport } from 'next'
import './globals.css'
import { I18nProvider } from '@/lib/i18n/context'

// Sử dụng system fonts thay vì Google Fonts để tránh lỗi SSL certificate
// Nếu muốn dùng Google Fonts, cần cấu hình SSL hoặc proxy đúng cách

export const metadata: Metadata = {
  title: 'Family Tasks - Quản lý nhiệm vụ gia đình',
  description: 'Ứng dụng quản lý nhiệm vụ gia đình với hệ thống XP và Coin',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Family Tasks',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        {/* Favicon sẽ được tạo sau khi có PWA icons */}
      </head>
      <body className="font-sans">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}

