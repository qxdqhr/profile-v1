import { createBatchDeleteEventsHandler } from 'sa2kit/calendar/routes';
import { db } from '@/db';
import { validateApiAuthNumeric } from 'sa2kit/auth';

const config = { db, validateAuth: validateApiAuthNumeric };

export const DELETE = createBatchDeleteEventsHandler(config);
