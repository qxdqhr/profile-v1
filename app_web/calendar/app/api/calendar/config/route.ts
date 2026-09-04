import { db } from '@profile/db';
import { getApiSessionUser } from '@profile/auth/session';
import {
  createGetCalendarConfigHandler,
  createUpsertCalendarConfigHandler,
} from 'sa2kit/business/calendar/routes';

const config = { db, getSessionUser: getApiSessionUser };

export const GET = createGetCalendarConfigHandler(config);
export const PUT = createUpsertCalendarConfigHandler(config);
