import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 验证会话
  const validateSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/validate');
      const data = await response.json();
      
      if (data.valid && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('会话验证失败:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // 登出
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('登出失败:', error);
    }
  }, []);

  // 刷新用户信息
  const refreshUser = useCallback(() => {
    setLoading(true);
    validateSession();
  }, [validateSession]);

  // 初始化时验证会话
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  return {
    user,
    loading,
    isAuthenticated,
    logout,
    refreshUser,
  };
}; 