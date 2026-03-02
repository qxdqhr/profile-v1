import { LegacyAuthDbService } from 'sa2kit/auth/legacy/services';
import { createLegacyValidateApiAuth } from 'sa2kit/auth/legacy/server';
import { db } from '@/db/index';
import { users, userSessions, verificationCodes } from '@/lib/auth/schema';

export const authService = new LegacyAuthDbService({
  db,
  tables: {
    users,
    userSessions,
    verificationCodes,
  },
});

export const validateApiAuth = createLegacyValidateApiAuth(authService, {
  cookieName: 'session_token',
});
