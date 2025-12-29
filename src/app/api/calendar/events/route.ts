import { createGetEventsHandler, createCreateEventHandler } from 'sa2kit/calendar/routes';
import { db } from '@/db';
import { validateApiAuthNumeric } from 'sa2kit/auth';

const config = { db, validateAuth: validateApiAuthNumeric };

export const GET = createGetEventsHandler(config);
export const POST = createCreateEventHandler(config);
