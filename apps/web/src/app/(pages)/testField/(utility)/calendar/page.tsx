import { redirect } from 'next/navigation';
import { getCalendarAppUrl } from '@/lib/calendar-app-url';

/** 旧实验田路径兼容：302 至 calendar 子应用 */
export default function TestFieldCalendarRedirectPage() {
  redirect(getCalendarAppUrl());
}
