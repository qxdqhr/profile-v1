import { db } from '@profile/db';
import { getApiSessionUser } from '@profile/auth/session';
import {
  createGetEventHandler,
  createUpdateEventHandler,
  createDeleteEventHandler,
} from 'sa2kit/business/calendar/routes';

const config = { db, getSessionUser: getApiSessionUser };

export const GET = createGetEventHandler(config);
export const PUT = createUpdateEventHandler(config);
export const DELETE = createDeleteEventHandler(config);
