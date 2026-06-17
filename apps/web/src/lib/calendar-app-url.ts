const DEFAULT_CALENDAR_APP_URL = 'http://localhost:3001';

function joinAppPath(base: string, path: string): string {
  const normalizedBase = base.replace(/\/$/, '');
  if (path === '/' || path === '') return normalizedBase || '/';
  return `${normalizedBase}${path.startsWith('/') ? path : `/${path}`}`;
}

/** calendar 子应用根 URL（本地默认 :3001；网关模式可设 `/calendar`） */
export function getCalendarAppUrl(path = '/'): string {
  const base =
    process.env.NEXT_PUBLIC_CALENDAR_URL?.trim() || DEFAULT_CALENDAR_APP_URL;
  if (base.startsWith('/')) {
    return joinAppPath(base, path);
  }
  return joinAppPath(base, path);
}
