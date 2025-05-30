import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 验证会话
  const validateSession = useCallback(async () => {
    console.log('🔍 [useAuth] 开始验证会话...');
    try {
      const response = await fetch('/api/auth/validate');
      console.log('📡 [useAuth] 会话验证响应状态:', response.status);
      
      const data = await response.json();
      console.log('📄 [useAuth] 会话验证响应数据:', data);
      
      if (data.valid && data.user) {
        console.log('✅ [useAuth] 会话验证成功, 用户:', data.user);
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        console.log('❌ [useAuth] 会话验证失败:', data.message);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('💥 [useAuth] 会话验证异常:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      console.log('🏁 [useAuth] 会话验证完成, isAuthenticated:', isAuthenticated);
    }
  }, []);

  // 登出
  const logout = useCallback(async () => {
    console.log('🚪 [useAuth] 开始登出...');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ [useAuth] 登出成功');
    } catch (error) {
      console.error('💥 [useAuth] 登出失败:', error);
    }
  }, []);

  // 刷新用户信息
  const refreshUser = useCallback(() => {
    console.log('🔄 [useAuth] 刷新用户信息...');
    setLoading(true);
    validateSession();
  }, [validateSession]);

  // 初始化时验证会话
  useEffect(() => {
    console.log('🚀 [useAuth] 初始化, 开始验证会话');
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