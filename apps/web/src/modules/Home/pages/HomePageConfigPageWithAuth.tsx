'use client';

import React from 'react';
import { AuthProvider, AuthGuard } from '@/lib/auth';
import { PermissionGuard } from '@/modules/testField/components/PermissionGuard';
import { HomePageConfigPage } from './HomePageConfigPage';

export function HomePageConfigPageWithAuth() {
  return (
    <AuthProvider>
      <AuthGuard requireAuth>
        <PermissionGuard>
          <HomePageConfigPage />
        </PermissionGuard>
      </AuthGuard>
    </AuthProvider>
  );
}
