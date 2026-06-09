import { createSa2kitAuth } from 'sa2kit/common/auth/server';
import { db } from '@/db/index';

function resolveAuthBaseUrl(): string {
  return (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    'http://localhost:3000'
  );
}

function resolveAuthSecret(): string {
  const secret =
    process.env.BETTER_AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    'dev-better-auth-secret-min-32-chars!!';
  if (secret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET 至少 32 字符');
  }
  return secret;
}

const baseURL = resolveAuthBaseUrl();

export const auth = createSa2kitAuth({
  db,
  baseURL,
  secret: resolveAuthSecret(),
  trustedOrigins: [baseURL, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(
    (origin, index, list) => list.indexOf(origin) === index,
  ),
  logOtpInDev: process.env.NODE_ENV !== 'production',
});
