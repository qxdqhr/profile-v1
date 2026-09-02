import { resolveAuthBaseURL } from '../packages/auth/src/resolve-auth-base-url';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function main() {
  assert(
    resolveAuthBaseURL({
      windowOrigin: 'http://localhost:3001',
      windowHostname: 'localhost',
      configured: 'http://localhost:3000',
    }) === 'http://localhost:3000',
    'local sidecar should hit main web',
  );
  assert(
    resolveAuthBaseURL({
      windowOrigin: 'http://127.0.0.1:3005',
      windowHostname: '127.0.0.1',
      configured: 'http://localhost:3000',
    }) === 'http://localhost:3000',
    '127.0.0.1 sidecar should hit configured local publicUrl',
  );
  assert(
    resolveAuthBaseURL({
      windowOrigin: 'https://qhr062.top',
      windowHostname: 'qhr062.top',
      configured: 'http://localhost:3000',
    }) === 'https://qhr062.top',
    'production must keep current origin (ignore baked localhost)',
  );
  assert(
    resolveAuthBaseURL({
      windowOrigin: 'https://qhr062.top',
      windowHostname: 'qhr062.top',
      configured: 'https://qhr062.top',
    }) === 'https://qhr062.top',
    'production configured publicUrl still uses origin',
  );
  assert(
    resolveAuthBaseURL({
      configured: 'http://localhost:3000',
    }) === 'http://localhost:3000',
    'SSR uses NEXT_PUBLIC_APP_URL',
  );
  assert(
    resolveAuthBaseURL({}) === 'http://localhost:3000',
    'SSR fallback is main web',
  );
  assert(
    resolveAuthBaseURL({
      windowOrigin: 'http://localhost:3001',
      windowHostname: 'localhost',
      configured: 'not a url',
    }) === 'http://localhost:3001',
    'invalid configured URL falls back to origin',
  );
  console.log('resolveAuthBaseURL checks passed');
}

main();
