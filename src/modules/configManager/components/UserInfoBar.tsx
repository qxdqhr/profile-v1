/**
 * 用户信息栏组件
 * 
 * 显示当前登录用户信息，提供登出功能
 */

'use client';

import React from 'react';
import { useAuth } from '@/modules/auth';
import { LogOut, User, Settings } from 'lucide-react';

export const UserInfoBar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // 登出后重定向到首页
      window.location.href = '/';
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {user.name || user.email || '用户'}
            </span>
            {user.role && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Settings className="w-4 h-4" />
            <span>配置管理</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LogOut className="w-4 h-4 mr-1" />
            登出
          </button>
        </div>
      </div>
    </div>
  );
}; 