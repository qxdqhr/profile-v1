'use client';

import { AuthProvider } from 'sa2kit/auth/legacy';
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
