import { createLegacyLoginHandler } from 'sa2kit/auth/legacy/routes';
import { authService } from '@/lib/auth/legacy';

export const POST = createLegacyLoginHandler({
  authService,
  cookieOptions: {
    name: 'session_token',
    secure: false,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  },
});
