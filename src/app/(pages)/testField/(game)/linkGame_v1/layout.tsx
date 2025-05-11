import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '葱韵连连看',
  description: '葱韵连连看',
}

export default function LinkGameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 