import {
  hasSessionCookie,
  isPublicApi,
  isSessionCookieName,
} from '../app_web/web/src/lib/auth/public-api';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function main() {
  assert(isPublicApi('/api/auth/get-session', 'GET'), 'auth GET');
  assert(isPublicApi('/api/auth/sign-in/email', 'POST'), 'auth POST');
  assert(isPublicApi('/api/homePage', 'GET'), 'home GET');
  assert(!isPublicApi('/api/homePage/config', 'GET'), 'admin home config is not public');
  assert(isPublicApi('/api/mmd/models/abc', 'GET'), 'mmd model GET');
  assert(!isPublicApi('/api/mmd/models', 'POST'), 'mmd model POST needs session');
  assert(isPublicApi('/api/mikutap/background-music', 'GET'), 'mikutap bgm GET');
  assert(!isPublicApi('/api/mikutap/background-music/debug', 'GET'), 'mikutap debug not public');
  assert(!isPublicApi('/api/fitnessPlan/plans', 'GET'), 'fitness needs session');
  assert(!isPublicApi('/api/ideaLists/lists', 'GET'), 'ideaLists needs session');
  assert(isPublicApi('/api/ticket-monitor/cron/sync', 'POST'), 'cron secret path public to middleware');
  assert(!isPublicApi('/api/music/search', 'GET'), 'music proxy is not public');
  assert(!isPublicApi('/api/list-mmd-files', 'GET'), 'mmd file dump is not public');
  assert(!isPublicApi('/api/xfyun/iat-url', 'GET'), 'xfyun signing is not public');
  assert(!isPublicApi('/api/exam/types', 'GET'), 'exam admin APIs are not public');
  assert(isPublicApi('/api/mmd/models/abc', 'HEAD'), 'public GET allows HEAD');
  assert(isPublicApi('/api/mmd/models/abc/', 'GET'), 'trailing slash normalized');
  assert(isPublicApi('/api/mikuFireworks3D/sync', 'POST'), 'fireworks sync intentionally public');
  assert(isPublicApi('/api/homeContact', 'POST'), 'home contact intentionally public');
  assert(!isPublicApi('/api/universal-file/files', 'POST'), 'universal-file write needs session');
  assert(!isPublicApi('/api/universal-file/folders', 'DELETE'), 'universal-file folders write needs session');
  assert(!isPublicApi('/api/universal-file/monitoring', 'POST'), 'monitoring write needs session');
  assert(!isPublicApi('/api/universal-export/export', 'POST'), 'export needs session');
  assert(!isPublicApi('/api/universal-export/configs', 'POST'), 'export config write needs session');
  assert(
    !isPublicApi('/api/testField/experiment/config/questions', 'POST'),
    'exam questions write needs session',
  );
  assert(
    !isPublicApi('/api/testField/experiment/config/examTypes', 'PUT'),
    'exam types write needs session',
  );
  assert(!isPublicApi('/api/examples/qqbot/send', 'POST'), 'examples qqbot not public');
  assert(hasSessionCookie('better-auth.session_token=abc'), 'plain session cookie');
  assert(hasSessionCookie('foo=1; __Secure-better-auth.session_token=xyz'), 'secure session cookie');
  assert(hasSessionCookie('better-auth.session_token.0=chunk'), 'chunked session cookie');
  assert(isSessionCookieName('__Host-better-auth.session_token'), 'host-prefix cookie name');
  assert(!hasSessionCookie('theme=dark'), 'unrelated cookie');
  assert(!hasSessionCookie('Authorization=Bearer abc'), 'bearer is not a session cookie');
  assert(!hasSessionCookie(null), 'null cookie header');
  console.log('public API allowlist checks passed');
}

main();
