// 用户信息接口
export interface User {
  id: number;
  phone: string;
  name?: string | null;
  email?: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// 登录请求接口
export interface LoginRequest {
  phone: string;
  code: string;
}

// 登录响应接口
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  sessionToken?: string;
}

// 发送验证码请求接口
export interface SendCodeRequest {
  phone: string;
  type?: 'login' | 'register' | 'reset';
}

// 发送验证码响应接口
export interface SendCodeResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
  code?: string; // 仅在开发环境下返回
}

// 会话验证响应接口
export interface SessionValidationResponse {
  valid: boolean;
  user?: User;
  message?: string;
}

// 验证码类型
export type VerificationCodeType = 'login' | 'register' | 'reset';

// 用户角色
export type UserRole = 'user' | 'admin'; 