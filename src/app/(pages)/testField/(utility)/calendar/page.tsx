/**
 * 实验田日历页面
 * 
 * 这是使用 sa2kit 版本的日历入口页面
 */

'use client';

import { CalendarPage } from 'sa2kit/calendar';
import { useAuth, LoginModal } from '@/modules/auth';
import { useState } from 'react';

export default function TestFieldCalendarPage() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 将 auth 模块的用户对象转换为 CalendarPage 期望的结构
  const calendarUser = user ? { 
    id: user.id, 
    name: user.name || user.phone || 'User' 
  } : null;

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    refreshUser(); // 刷新用户信息
  };

  return (
    <>
      <CalendarPage 
        user={calendarUser} 
        isAuthenticated={isAuthenticated} 
        onShowLogin={() => setIsLoginModalOpen(true)}
      />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSuccess={handleLoginSuccess}
      />
    </>
  );
} 
