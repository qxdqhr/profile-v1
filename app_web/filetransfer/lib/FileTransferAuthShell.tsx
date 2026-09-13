'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@profile/auth/react';

export default function FileTransferAuthShell({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
