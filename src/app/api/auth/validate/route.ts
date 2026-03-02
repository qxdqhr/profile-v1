import { createLegacyValidateHandler } from 'sa2kit/auth/legacy/routes';
import { authService } from '@/lib/auth/legacy';

export const dynamic = 'force-dynamic';

export const GET = createLegacyValidateHandler({
  authService,
  cookieOptions: {
    name: 'session_token',
  },
});
