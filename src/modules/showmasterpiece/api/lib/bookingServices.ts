import { db } from '@/db';
import {
  createBookingCommandService,
  createBookingQueryService,
} from 'sa2kit/showmasterpiece/server';
import '@/modules/showmasterpiece/sa2kit-init';

export const bookingQueryService = createBookingQueryService(db);
export const bookingCommandService = createBookingCommandService(db);
