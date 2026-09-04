/**
 * Calendar 服务端导出 — 过渡期 facade → sa2kit/business/calendar/server
 */
export {
  calendarDbService,
  CalendarDbService,
  createCalendarDbService,
} from './db/calendarDbService';

export * from './db/schema';

export { DEFAULT_CALENDAR_CONFIG } from 'sa2kit/business/calendar/server';

export {
  validateEventData,
  validateRecurrenceData,
  generateRecurrenceInstances,
  calculateReminderTime,
  createErrorResponse,
  createSuccessResponse,
  checkEventPermission,
  CALENDAR_SERVER_MODULE_VERSION,
  CALENDAR_SERVER_MODULE_NAME,
} from './serverLegacy';
