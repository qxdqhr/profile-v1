import { mountNextAuthHandler } from 'sa2kit/common/auth/server';
import { auth } from '@profile/auth/server';

export const { GET, POST, PUT, PATCH, DELETE } = mountNextAuthHandler(auth);
