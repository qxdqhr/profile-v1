'use client';

import { createSa2kitAuthClient } from 'sa2kit/common/auth/react';

const baseURL =
  typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');

export const authClient = createSa2kitAuthClient({ baseURL });
