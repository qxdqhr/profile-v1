/**
 * 带认证的配置管理页面
 * 
 * 包装了AuthGuard和AuthProvider，确保只有登录用户才能访问
 */

'use client';

import React from 'react';
import { AuthProvider, AuthGuard } from '@/lib/auth';
import { ConfigManagerPage } from './ConfigManagerPage';
import { PermissionGuard } from '../components/PermissionGuard';

export const ConfigManagerPageWithAuth: React.FC = () => {
  return (
    <AuthProvider>
      <AuthGuard requireAuth={true}>
        <PermissionGuard requiredRole="ADMIN">
          <ConfigManagerPage />
        </PermissionGuard>
      </AuthGuard>
    </AuthProvider>
  );
}; 