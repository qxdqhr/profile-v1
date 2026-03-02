import { createLegacySendVerificationCodeHandler } from 'sa2kit/auth/legacy/routes';
import { authService } from '@/lib/auth/legacy';

export const POST = createLegacySendVerificationCodeHandler({
  authService,
});
