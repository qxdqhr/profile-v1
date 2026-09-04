'use client';

import { createSa2kitAuthClient } from 'sa2kit/common/auth/react';
import { resolveAuthBaseURL } from './resolve-auth-base-url';

const baseURL = resolveAuthBaseURL({
  windowOrigin: typeof window !== 'undefined' ? window.location.origin : undefined,
  windowHostname: typeof window !== 'undefined' ? window.location.hostname : undefined,
  configured: process.env.NEXT_PUBLIC_APP_URL,
});

export const authClient = createSa2kitAuthClient({ baseURL });
