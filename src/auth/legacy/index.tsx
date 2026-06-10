'use client';

import React, { useCallback, useMemo } from 'react';
import {
  AuthProvider as Sa2kitAuthProvider,
  useAuthContext,
} from 'sa2kit/common/auth/react';
import {
  UserMenu,
  LoginModal,
  RegisterModal,
  ForgotPasswordModal,
} from 'sa2kit/common/auth/components';
import { AuthGuard } from './AuthGuard';
import { LoginRegisterModals } from './LoginRegisterModals';
import { authClient } from '@/lib/auth/client';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  UseAuthReturn,
  UserMenuProps,
  CustomMenuItem,
} from '@/lib/auth/types';

export type { User, UseAuthReturn, UserMenuProps, CustomMenuItem };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <Sa2kitAuthProvider authClient={authClient}>{children}</Sa2kitAuthProvider>;
}

function mapSessionUser(raw: Record<string, unknown> | null | undefined): User | null {
  if (!raw?.id || typeof raw.id !== 'string') return null;
  const role = typeof raw.role === 'string' ? raw.role.toLowerCase() : 'user';
  return {
    id: raw.id,
    phone: typeof raw.phoneNumber === 'string' ? raw.phoneNumber : '',
    name: typeof raw.name === 'string' ? raw.name : null,
    email: typeof raw.email === 'string' ? raw.email : null,
    role,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function useAuth(): UseAuthReturn {
  const ctx = useAuthContext();

  const user = useMemo(() => mapSessionUser(ctx.user as Record<string, unknown> | null), [ctx.user]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const result = await ctx.signInWithPhonePassword(credentials.phone, credentials.password);
      if (!result.success) {
        return { success: false, message: result.error ?? '登录失败' };
      }
      await ctx.refreshSession();
      return { success: true };
    },
    [ctx],
  );

  const register = useCallback(
    async (userData: RegisterRequest) => {
      const otp = await ctx.sendPhoneOtp(userData.phone);
      if (!otp.success) {
        return { success: false, message: otp.error ?? '验证码发送失败' };
      }
      return {
        success: false,
        message: '请使用登录弹窗完成手机验证码注册（3.0 Better Auth）',
      };
    },
    [ctx],
  );

  const logout = useCallback(async () => {
    await ctx.signOut();
    await ctx.refreshSession();
  }, [ctx]);

  const refreshUser = useCallback(() => {
    void ctx.refreshSession();
  }, [ctx]);

  return {
    user,
    loading: ctx.loading,
    isAuthenticated: ctx.isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };
}

export { AuthGuard, UserMenu, LoginModal, RegisterModal, ForgotPasswordModal, LoginRegisterModals };
