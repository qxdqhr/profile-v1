/**
 * 兼容单例：注入 `@profile/db`。新代码请用 `createCalendarDbService(db)`。
 */
import { db } from '@profile/db';
import { createCalendarDbService } from 'sa2kit/business/calendar/server';

export {
  CalendarDbService,
  createCalendarDbService,
  type DrizzleLikeDb,
} from 'sa2kit/business/calendar/server';

export const calendarDbService = createCalendarDbService(db);
export default calendarDbService;
