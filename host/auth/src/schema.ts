export {
  user,
  session,
  account,
  verification,
  verifications,
  userRelations,
  sessionRelations,
  accountRelations,
  authDrizzleSchema,
  userRole,
  CREDENTIAL_ACCOUNT_ISSUER,
  type UserRole,
} from '@profile/db/schema/auth';

/** 兼容旧模块 import { users } from '@/lib/auth/schema' */
export { user as users } from '@profile/db/schema/auth';
