import './globals.css'
import type { Viewport } from 'next'

export const metadata = {
  title: 'Profile V1 - Interactive Playground',
  description: 'Interactive playground with games, tools and creative modules',
}

// 添加单独的viewport导出
export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
