import { db } from '@profile/db';
import {
  createBookingCommandService,
  createBookingQueryService,
} from 'sa2kit/business/showmasterpiece/server';


export const bookingQueryService = createBookingQueryService(db);
export const bookingCommandService = createBookingCommandService(db);
