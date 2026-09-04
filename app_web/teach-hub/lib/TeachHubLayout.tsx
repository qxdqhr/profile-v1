'use client';

/**
 * 宿主薄壳：注入 AuthProvider。UI 在 sa2kit/business/teachHub/ui/web。
 */
import React from 'react';
import { AuthProvider } from '@profile/auth/react';
import { TeachHubLayout as TeachHubLayoutApp } from 'sa2kit/business/teachHub/ui/web';

export function TeachHubLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TeachHubLayoutApp>{children}</TeachHubLayoutApp>
    </AuthProvider>
  );
}
