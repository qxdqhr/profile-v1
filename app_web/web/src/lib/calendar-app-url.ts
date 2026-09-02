const DEFAULT_CALENDAR_APP_URL = 'http://localhost:3001';
const GATEWAY_CALENDAR_PATH = '/calendar';

function joinAppPath(base: string, path: string): string {
  const normalizedBase = base.replace(/\/$/, '');
  if (path === '/' || path === '') return normalizedBase || '/';
  return `${normalizedBase}${path.startsWith('/') ? path : `/${path}`}`;
}

function resolveCalendarBase(): string {
  const explicit = process.env.NEXT_PUBLIC_CALENDAR_URL?.trim();
  if (explicit) return explicit;
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return GATEWAY_CALENDAR_PATH;
    }
  }
  return DEFAULT_CALENDAR_APP_URL;
}

/** calendar 子应用根 URL（本地默认 :3001；网关模式可设 `/calendar`） */
export function getCalendarAppUrl(path = '/'): string {
  const base = resolveCalendarBase();
  if (base.startsWith('/')) {
    return joinAppPath(base, path);
  }
  return joinAppPath(base, path);
}
