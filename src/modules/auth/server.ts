// ===== 服务端专用导出 =====
// 这些只能在服务端使用（API路由、服务器组件等）

export { authDbService } from './services/authDbService';
export { validateApiAuth } from './utils/serverUtils';

// 重新导出类型，方便服务端使用
export type {
  User,
  UserSession,
  LoginRequest,
  LoginResponse,
  SessionValidationResponse,
  SessionValidation,
  AuthService,
  ValidateApiAuth,
  SessionConfig,
} from './types';

export { UserRole } from './types'; 