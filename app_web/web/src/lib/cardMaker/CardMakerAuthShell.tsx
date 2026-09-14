'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';

/** 宿主薄壳：AuthProvider 包裹 sa2kit cardMaker 页面 */
export default function CardMakerAuthShell({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
