import { createConfigHandler } from 'sa2kit/calendar/routes';
import { db } from '@/db';
import { validateApiAuthNumeric } from 'sa2kit/auth';

const config = { db, validateAuth: validateApiAuthNumeric };

const handlers = createConfigHandler(config);
export const GET = handlers.GET;
export const PUT = handlers.PUT;
