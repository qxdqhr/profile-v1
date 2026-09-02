import { redirect } from 'next/navigation';
import { getCalendarAppUrl } from '@/lib/calendar-app-url';

/** 日历演示已迁至 @profile/calendar 子应用 */
export default function CalendarDemoRedirectPage() {
  redirect(getCalendarAppUrl());
}
