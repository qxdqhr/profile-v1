/**
 * 权限守卫组件
 * 
 * 检查用户是否有配置管理权限
 */

'use client';

import React from 'react';
import { useAuth } from '@/modules/auth';
import { Shield, AlertTriangle } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRole = 'admin',
  fallback
}) => {
  const { user, isAuthenticated } = useAuth();

  // 检查用户是否有权限
  const hasPermission = () => {
    if (!isAuthenticated || !user) {
      return false;
    }

    // 检查用户角色
    if (user.role === 'admin' || user.role === 'super_admin') {
      return true;
    }

    // 检查特定角色
    if (requiredRole && user.role === requiredRole) {
      return true;
    }

    // 检查用户权限列表（如果有的话）
    if ((user as any).permissions && Array.isArray((user as any).permissions)) {
      return (user as any).permissions.includes('config:manage') || 
             (user as any).permissions.includes('config:read');
    }

    return false;
  };

  if (!hasPermission()) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            权限不足
          </h2>
          <p className="text-gray-600 mb-4">
            您没有访问配置管理页面的权限。
            {requiredRole && `需要 ${requiredRole} 权限。`}
          </p>
          <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
            <AlertTriangle className="w-4 h-4 mr-1" />
            当前用户: {user?.name || user?.email || '未知用户'}
          </div>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 