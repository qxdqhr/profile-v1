import { db } from '@profile/db';
import { getApiSessionUser } from '@profile/auth/session';
import { createBatchDeleteEventsHandler } from 'sa2kit/business/calendar/routes';

const config = { db, getSessionUser: getApiSessionUser };

export const DELETE = createBatchDeleteEventsHandler(config);
