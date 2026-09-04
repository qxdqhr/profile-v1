import { db } from '@profile/db';
import { getApiSessionUser } from '@profile/auth/session';
import {
  createListEventsHandler,
  createCreateEventHandler,
} from 'sa2kit/business/calendar/routes';

const config = {
  db,
  getSessionUser: getApiSessionUser,
};

export const GET = createListEventsHandler(config);
export const POST = createCreateEventHandler(config);
