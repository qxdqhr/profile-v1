import { createLegacyLogoutHandler } from 'sa2kit/auth/legacy/routes';
import { authService } from '@/lib/auth/legacy';

export const POST = createLegacyLogoutHandler({
  authService,
  cookieOptions: {
    name: 'session_token',
    secure: false,
    sameSite: 'lax',
    path: '/',
  },
});
