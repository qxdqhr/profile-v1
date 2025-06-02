// ===== 客户端组件导出 =====
export { default as LoginModal } from './components/LoginModal';
export { default as RegisterModal } from './components/RegisterModal';
export { default as AuthGuard } from './components/AuthGuard';
export { default as UserMenu } from './components/UserMenu';

// ===== Hook导出 =====
export { AuthProvider, useAuth } from './contexts/AuthContext';

// ===== 客户端工具函数导出 =====
export { 
  validatePhoneNumber, 
  validatePassword,
  isAdmin,
  isActiveUser,
  getUserDisplayName,
  calculateSessionExpiry,
  isSessionExpired,
  generateSessionToken
} from './utils/authUtils';

// ===== 类型导出 =====
export type {
  User,
  UserSession,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  SessionValidationResponse,
  SessionValidation,
  LoginModalProps,
  RegisterModalProps,
  AuthGuardProps,
  UserMenuProps,
  CustomMenuItem,
  UseAuthReturn,
  AuthService,
  ValidateApiAuth,
  SessionConfig,
} from './types';

export { UserRole } from './types';

// ===== 模块信息 =====
export const AUTH_MODULE_VERSION = '1.0.0';
export const AUTH_MODULE_NAME = '@profile-v1/auth';

// ===== 服务端专用导出 =====
// 注意：这些只能在服务端使用，不要在客户端组件中导入
// 使用方式：import { authDbService } from '@/modules/auth/server';
// 或者：import { validateApiAuth } from '@/modules/auth/server'; 