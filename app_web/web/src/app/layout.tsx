import './globals.css'
import type { Viewport } from 'next'

export const metadata = {
  title: 'Profile V1 - Interactive Playground',
  description: 'Interactive playground with games, tools and creative modules',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
