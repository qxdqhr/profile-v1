import { db } from '@/db';
import {
  createBookingCommandService,
  createBookingQueryService,
} from '@/modules/showmasterpiece/server';
import '@/modules/showmasterpiece/init';

export const bookingQueryService = createBookingQueryService(db);
export const bookingCommandService = createBookingCommandService(db);
