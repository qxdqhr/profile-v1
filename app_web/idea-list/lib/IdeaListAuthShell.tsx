'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@profile/auth/react';

/** 宿主薄壳：AuthProvider 包裹 sa2kit ideaList 页面 */
export default function IdeaListAuthShell({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
