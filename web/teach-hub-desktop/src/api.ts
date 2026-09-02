import { TeachHubApiClient } from '@profile/teach-hub-shared';

export const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:3000';
export const TEACH_HUB_API_BASE_URL =
  import.meta.env.VITE_TEACH_HUB_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:3002';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

type GetSessionResponse = {
  user?: AuthUser | null;
};

export async function fetchSession(): Promise<AuthUser | null> {
  const response = await fetch(`${AUTH_BASE_URL}/api/auth/get-session`, {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const data = (await response.json()) as GetSessionResponse;
  return data.user ?? null;
}

export function createTeachHubClient(onUnauthorized?: () => void): TeachHubApiClient {
  return new TeachHubApiClient({
    apiBaseUrl: TEACH_HUB_API_BASE_URL,
    credentials: 'include',
    onUnauthorized,
  });
}
