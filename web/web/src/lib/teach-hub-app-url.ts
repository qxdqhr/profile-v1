const DEFAULT_TEACH_HUB_APP_URL = 'http://localhost:3002';
const GATEWAY_TEACH_HUB_PATH = '/teach-hub';

function joinAppPath(base: string, path: string): string {
  const normalizedBase = base.replace(/\/$/, '');
  if (path === '/' || path === '') return normalizedBase || '/';
  return `${normalizedBase}${path.startsWith('/') ? path : `/${path}`}`;
}

function resolveTeachHubBase(): string {
  const explicit = process.env.NEXT_PUBLIC_TEACH_HUB_URL?.trim();
  if (explicit) return explicit;
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return GATEWAY_TEACH_HUB_PATH;
    }
  }
  return DEFAULT_TEACH_HUB_APP_URL;
}

/** teach-hub 子应用根 URL（本地默认 :3002；网关模式可设 `/teach-hub`） */
export function getTeachHubAppUrl(path = '/'): string {
  const base = resolveTeachHubBase();
  if (base.startsWith('/')) {
    return joinAppPath(base, path);
  }
  return joinAppPath(base, path);
}

/** 将 legacy 路径片段（testField/teachHub 下）映射为子应用 URL */
export function getTeachHubAppUrlFromSegments(segments: string[] = []): string {
  const suffix = segments.length ? `/${segments.join('/')}` : '/';
  return getTeachHubAppUrl(suffix);
}
