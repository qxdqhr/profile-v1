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
} from 'sa2kit/common/auth/schema';

/** 兼容旧模块 import { users } from '@/lib/auth/schema' */
export { user as users } from 'sa2kit/common/auth/schema';
