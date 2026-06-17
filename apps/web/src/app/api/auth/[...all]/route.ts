import { mountNextAuthHandler } from 'sa2kit/common/auth/server';
import { auth } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export const { GET, POST, PUT, PATCH, DELETE } = mountNextAuthHandler(auth);
