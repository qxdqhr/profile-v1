const DEFAULT_SHOWMASTERPIECE_APP_URL = 'http://localhost:3003';
const GATEWAY_SHOWMASTERPIECE_PATH = '/showmasterpiece';

function joinAppPath(base: string, path: string): string {
  const normalizedBase = base.replace(/\/$/, '');
  if (path === '/' || path === '') return normalizedBase || '/';
  return `${normalizedBase}${path.startsWith('/') ? path : `/${path}`}`;
}

function resolveShowmasterpieceBase(): string {
  const explicit = process.env.NEXT_PUBLIC_SHOWMASTERPIECE_URL?.trim();
  if (explicit) return explicit;
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return GATEWAY_SHOWMASTERPIECE_PATH;
    }
  }
  return DEFAULT_SHOWMASTERPIECE_APP_URL;
}

/** showmasterpiece 子应用根 URL（本地默认 :3003；网关模式可设 `/showmasterpiece`） */
export function getShowmasterpieceAppUrl(path = '/'): string {
  const base = resolveShowmasterpieceBase();
  if (base.startsWith('/')) {
    return joinAppPath(base, path);
  }
  return joinAppPath(base, path);
}

/** legacy testField 路径片段映射为子应用 URL */
export function getShowmasterpieceAppUrlFromLegacy(segments: string[] = []): string {
  const map: Record<string, string> = {
    config: '/config',
    history: '/history',
  };
  const suffix = segments.length ? map[segments[0]] ?? `/${segments.join('/')}` : '/';
  return getShowmasterpieceAppUrl(suffix);
}
