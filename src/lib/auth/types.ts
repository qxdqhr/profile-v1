/** profile-v1 API 鉴权用户（Better Auth session 适配） */
export type User = {
  id: string;
  phone: string;
  name?: string | null;
  email?: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LoginRequest = {
  phone: string;
  password: string;
};

export type RegisterRequest = {
  phone: string;
  password: string;
  name?: string;
};

export type UseAuthReturn = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; user?: User; message?: string }>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; user?: User; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => void;
};

export type { UserMenuProps, CustomMenuItem } from 'sa2kit/common/auth/components';
