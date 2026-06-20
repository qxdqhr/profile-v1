import Constants from 'expo-constants';

import { TeachHubApiClient } from '@profile/teach-hub-shared';

function readEnv(name: string, extraKey: string, fallback: string): string {
  const fromEnv = process.env[name]?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  const fromExtra = Constants.expoConfig?.extra?.[extraKey];
  if (typeof fromExtra === 'string' && fromExtra.trim()) {
    return fromExtra.trim().replace(/\/+$/, '');
  }

  return fallback.replace(/\/+$/, '');
}

export const AUTH_BASE_URL = readEnv(
  'EXPO_PUBLIC_AUTH_BASE_URL',
  'authBaseUrl',
  'http://localhost:3000',
);
export const TEACH_HUB_API_BASE_URL = readEnv(
  'EXPO_PUBLIC_TEACH_HUB_API_BASE_URL',
  'teachHubApiBaseUrl',
  'http://localhost:3002',
);

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

type GetSessionResponse = {
  user?: AuthUser | null;
  session?: { id: string } | null;
};

export async function fetchSession(cookieHeader?: string | null): Promise<AuthUser | null> {
  const headers: HeadersInit = {};
  if (cookieHeader) headers.Cookie = cookieHeader;

  const response = await fetch(`${AUTH_BASE_URL}/api/auth/get-session`, {
    headers,
    credentials: cookieHeader ? 'omit' : 'include',
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const data = (await response.json()) as GetSessionResponse;
  return data.user ?? null;
}

export async function signOut(cookieHeader?: string | null): Promise<void> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (cookieHeader) headers.Cookie = cookieHeader;

  await fetch(`${AUTH_BASE_URL}/api/auth/sign-out`, {
    method: 'POST',
    headers,
    credentials: cookieHeader ? 'omit' : 'include',
  });
}

export function createTeachHubClient(
  cookieHeader?: string | null,
  onUnauthorized?: () => void,
): TeachHubApiClient {
  return new TeachHubApiClient({
    apiBaseUrl: TEACH_HUB_API_BASE_URL,
    credentials: cookieHeader ? 'omit' : 'include',
    getHeaders: cookieHeader ? () => ({ Cookie: cookieHeader }) : undefined,
    onUnauthorized,
  });
}
