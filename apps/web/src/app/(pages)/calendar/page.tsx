import { redirect } from 'next/navigation';
import { getCalendarAppUrl } from '@/lib/calendar-app-url';

/** 产品入口：重定向至 @profile/calendar 子应用 */
export default function CalendarEntryPage() {
  redirect(getCalendarAppUrl());
}
