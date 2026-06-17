const DEFAULT_CALENDAR_APP_URL = 'http://localhost:3001';

/** calendar 子应用根 URL（本地默认 :3001；生产由 NEXT_PUBLIC_CALENDAR_URL 配置） */
export function getCalendarAppUrl(path = '/'): string {
  const base =
    process.env.NEXT_PUBLIC_CALENDAR_URL?.trim() || DEFAULT_CALENDAR_APP_URL;
  const normalizedBase = base.replace(/\/$/, '');
  if (path === '/' || path === '') return normalizedBase;
  return `${normalizedBase}${path.startsWith('/') ? path : `/${path}`}`;
}
