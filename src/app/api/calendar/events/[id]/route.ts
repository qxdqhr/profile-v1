import { 
  createGetEventByIdHandler, 
  createUpdateEventHandler, 
  createDeleteEventHandler 
} from 'sa2kit/calendar/routes';
import { db } from '@/db';
import { validateApiAuthNumeric } from 'sa2kit/auth';

const config = { db, validateAuth: validateApiAuthNumeric };

export const GET = createGetEventByIdHandler(config);
export const PUT = createUpdateEventHandler(config);
export const DELETE = createDeleteEventHandler(config);
