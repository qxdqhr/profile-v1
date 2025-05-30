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
  password: string;
}

// 登录响应接口
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  sessionToken?: string;
}

// 会话验证响应接口
export interface SessionValidationResponse {
  valid: boolean;
  user?: User;
  message?: string;
}

// 用户角色
export type UserRole = 'user' | 'admin'; 