import { createSa2kitAuth, type Sa2kitAuthInstance } from 'sa2kit/common/auth/server';
import { db } from '@/db/index';

/** 避免 Next 构建期内联 env，Docker 运行时才能读到 --env-file */
function readRuntimeEnv(key: string): string | undefined {
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
}

function resolveAuthBaseUrl(): string {
  return (
    readRuntimeEnv('BETTER_AUTH_URL') ??
    readRuntimeEnv('NEXT_PUBLIC_APP_URL') ??
    readRuntimeEnv('NEXTAUTH_URL') ??
    'http://localhost:3000'
  );
}

function resolveAuthSecret(): string {
  const secret =
    readRuntimeEnv('BETTER_AUTH_SECRET') ??
    readRuntimeEnv('NEXTAUTH_SECRET') ??
    'dev-better-auth-secret-min-32-chars!!';
  if (secret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET 至少 32 字符');
  }
  return secret;
}

function resolveTrustedOrigins(baseURL: string): string[] {
  const fromEnv = readRuntimeEnv('BETTER_AUTH_TRUSTED_ORIGINS');
  const defaults = [
    baseURL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://qhr062.top',
    'https://www.qhr062.top',
  ];

  const extra = fromEnv
    ? fromEnv
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return [...defaults, ...extra].filter(
    (origin, index, list) => list.indexOf(origin) === index,
  );
}

let authInstance: Sa2kitAuthInstance | undefined;

export function getAuth(): Sa2kitAuthInstance {
  if (!authInstance) {
    const baseURL = resolveAuthBaseUrl();
    authInstance = createSa2kitAuth({
      db,
      baseURL,
      secret: resolveAuthSecret(),
      trustedOrigins: resolveTrustedOrigins(baseURL),
      logOtpInDev: process.env.NODE_ENV !== 'production',
    });
  }
  return authInstance;
}

/** 兼容现有 import { auth } */
export const auth = getAuth();
