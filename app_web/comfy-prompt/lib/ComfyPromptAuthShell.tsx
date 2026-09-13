'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@profile/auth/react';

export default function ComfyPromptAuthShell({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
