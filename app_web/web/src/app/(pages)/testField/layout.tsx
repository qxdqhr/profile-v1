'use client';

import { AuthProvider } from '@/lib/auth';
import type { ReactNode } from 'react';

export default function TestFieldLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <AuthProvider>
        {/* 主要内容 */}
        {/* <main> */}
          {children}
        {/* </main> */}
    </AuthProvider>
  )
}
