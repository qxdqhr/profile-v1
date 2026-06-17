import { getSessionUser, type SessionUser } from 'sa2kit/common/auth/server';
import { auth } from './server';

export type { SessionUser };

export async function getApiSessionUser(request: Request): Promise<SessionUser | null> {
  return getSessionUser(auth, request);
}

export function isAdminRole(role?: string | null): boolean {
  const normalized = role?.toUpperCase();
  return normalized === 'ADMIN' || normalized === 'SUPER_ADMIN';
}
