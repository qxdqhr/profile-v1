/**
 * 带认证的实验田页面
 * 
 * 包装了AuthGuard和AuthProvider，确保只有登录用户才能访问
 */

'use client';

import React from 'react';
import { AuthProvider, AuthGuard } from '@/modules/auth';
import TestFieldPage from './TestFieldPage';
import { PermissionGuard } from '../components/PermissionGuard';

export const TestFieldPageWithAuth: React.FC = () => {
  return (
    <AuthProvider>
      <AuthGuard requireAuth={true}>
        <PermissionGuard>
          <TestFieldPage />
        </PermissionGuard>
      </AuthGuard>
    </AuthProvider>
  );
}; 