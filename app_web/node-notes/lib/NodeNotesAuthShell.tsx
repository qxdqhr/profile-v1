'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@profile/auth/react';

/** 宿主薄壳：AuthProvider 包裹 sa2kit nodeNotes 页面 */
export default function NodeNotesAuthShell({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
