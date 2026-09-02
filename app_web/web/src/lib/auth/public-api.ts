export type PublicApiMatch = 'exact' | 'prefix';

export type PublicApiRule = {
  path: string;
  methods: readonly string[];
  match?: PublicApiMatch;
};

/** 无需登录即可访问的主站 API（方法敏感）。其余 /api/* 需带 session cookie。 */
export const PUBLIC_API_RULES: readonly PublicApiRule[] = [
  { path: '/api/auth', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], match: 'prefix' },
  { path: '/api/ticket-monitor/events', methods: ['GET'] },
  { path: '/api/ticket-monitor/sync-status', methods: ['GET'] },
  { path: '/api/ticket-monitor/config', methods: ['GET', 'PUT'] },
  { path: '/api/ticket-monitor/notifications/test', methods: ['POST'] },
  { path: '/api/ticket-monitor/cron/sync', methods: ['POST'] },
  { path: '/api/vocaloid-booth', methods: ['GET', 'POST'] },
  { path: '/api/mmd/models', methods: ['GET'], match: 'prefix' },
  { path: '/api/mmd/playlists', methods: ['GET'], match: 'prefix' },
  { path: '/api/mikutap/configs', methods: ['GET'] },
  { path: '/api/mikutap/sound-library', methods: ['GET'] },
  { path: '/api/mikutap/background-music', methods: ['GET'] },
  { path: '/api/cardMaker/assets', methods: ['GET'] },
  { path: '/api/cardMaker/assets/categories', methods: ['GET'] },
  { path: '/api/proxy-image', methods: ['GET'] },
  { path: '/api/homePage', methods: ['GET'] },
  { path: '/api/homeContact', methods: ['POST'] },
  { path: '/api/festivalCard', methods: ['GET'], match: 'prefix' },
  { path: '/api/huarongdao/config', methods: ['GET'] },
  { path: '/api/mikuFireworks3D/sync', methods: ['GET', 'POST'] },
];

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function pathMatches(pathname: string, rule: PublicApiRule): boolean {
  const path = normalizePath(pathname);
  const base = normalizePath(rule.path);
  if ((rule.match ?? 'exact') === 'prefix') {
    return path === base || path.startsWith(`${base}/`);
  }
  return path === base;
}

export function isPublicApi(pathname: string, method: string): boolean {
  const verb = method.toUpperCase();
  if (verb === 'OPTIONS' || verb === 'HEAD') {
    return PUBLIC_API_RULES.some(
      (rule) => pathMatches(pathname, rule) && (verb === 'OPTIONS' || rule.methods.includes('GET')),
    );
  }
  return PUBLIC_API_RULES.some(
    (rule) => pathMatches(pathname, rule) && rule.methods.includes(verb),
  );
}

const SESSION_COOKIE_NAME =
  /^(?:__Secure-|__Host-)?better-auth\.session_token(?:\.\d+)?$/;

export function isSessionCookieName(name: string): boolean {
  return SESSION_COOKIE_NAME.test(name);
}

export function hasSessionCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return /(?:^|;\s*)(?:__Secure-|__Host-)?better-auth\.session_token(?:\.\d+)?=/.test(
    cookieHeader,
  );
}
