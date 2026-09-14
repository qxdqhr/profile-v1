import { getSessionUser, type SessionUser } from 'sa2kit/common/auth/server';
import { getAuth } from './server';
import { isAdminRole } from './roles';

export type { SessionUser };
export { isAdminRole };

export async function getApiSessionUser(request: Request): Promise<SessionUser | null> {
  return getSessionUser(getAuth(), request);
}
