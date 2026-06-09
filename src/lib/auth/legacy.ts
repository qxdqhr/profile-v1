import { createSessionValidator } from 'sa2kit/common/auth/server';
import { auth } from '@/lib/auth/server';
import type { User } from '@/lib/auth/types';

const { getSessionUser } = createSessionValidator(auth);

function normalizeRole(role?: string | null): string {
  if (!role) return 'user';
  return role.toLowerCase().replace(/_/g, '_');
}

function toApiUser(sessionUser: {
  id: string;
  email: string;
  name: string;
  role?: string;
  phoneNumber?: string | null;
}): User {
  const now = new Date();
  return {
    id: sessionUser.id,
    phone: sessionUser.phoneNumber ?? '',
    name: sessionUser.name ?? null,
    email: sessionUser.email ?? null,
    role: normalizeRole(sessionUser.role),
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

/** 受保护 API 路由 session 校验（兼容旧 validateApiAuth 签名） */
export async function validateApiAuth(request: Request): Promise<User | null> {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser) return null;
  return toApiUser(sessionUser);
}
