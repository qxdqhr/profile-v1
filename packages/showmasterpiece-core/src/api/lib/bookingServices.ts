import { db } from '@profile/db';
import {
  createBookingCommandService,
  createBookingQueryService,
} from '@profile/showmasterpiece-core/server';


export const bookingQueryService = createBookingQueryService(db);
export const bookingCommandService = createBookingCommandService(db);
