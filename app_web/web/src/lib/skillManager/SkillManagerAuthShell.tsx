'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';

/** 宿主薄壳：AuthProvider 包裹 sa2kit skillManager 页面 */
export default function SkillManagerAuthShell({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
