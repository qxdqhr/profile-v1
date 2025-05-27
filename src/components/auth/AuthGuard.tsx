'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from './LoginModal';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ 
  children, 
  fallback,
  requireAuth = true 
}: AuthGuardProps) {
  const { isAuthenticated, loading, refreshUser } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [loading, requireAuth, isAuthenticated]);

  // 登录成功后的处理
  const handleLoginSuccess = () => {
    refreshUser();
    setShowLoginModal(false);
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        color: '#6b7280'
      }}>
        验证登录状态...
      </div>
    );
  }

  // 如果需要认证但未登录，显示登录模态框
  if (requireAuth && !isAuthenticated) {
    return (
      <>
        {fallback || (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            color: '#6b7280'
          }}>
            请先登录以访问此页面
          </div>
        )}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  // 已认证或不需要认证，显示子组件
  return <>{children}</>;
} 