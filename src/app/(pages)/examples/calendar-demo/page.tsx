'use client';

import React, { useState } from 'react';
import { CalendarPage } from 'sa2kit/calendar';

/**
 * 日历模块演示页面
 */
export default function CalendarDemoPage() {
  // 模拟身份验证状态
  const [user, setUser] = useState<{ id: number; name: string } | null>({ id: 1, name: '演示用户' });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleLogin = () => {
    setUser({ id: 1, name: '演示用户' });
    setIsAuthenticated(true);
    alert('已模拟登录');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    alert('已模拟登出');
  };

  const handleShowLogin = () => {
    const confirm = window.confirm('当前未登录，是否模拟登录？');
    if (confirm) handleLogin();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CalendarPage 
        user={user}
        isAuthenticated={isAuthenticated}
        onShowLogin={handleShowLogin}
        headerActions={
          isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">欢迎, {user?.name}</span>
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                退出登录
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              登录演示账号
            </button>
          )
        }
      />
    </div>
  );
}

