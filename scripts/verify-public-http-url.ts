import { assertPublicHttpUrl, isPrivateOrReservedIp } from '../app_web/web/src/lib/security/publicHttpUrl';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  assert(isPrivateOrReservedIp('127.0.0.1'), 'loopback');
  assert(isPrivateOrReservedIp('10.0.0.1'), '10/8');
  assert(isPrivateOrReservedIp('192.168.1.1'), '192.168');
  assert(isPrivateOrReservedIp('169.254.169.254'), 'link-local');
  assert(isPrivateOrReservedIp('::1'), 'v6 loopback');
  assert(!isPrivateOrReservedIp('8.8.8.8'), 'public v4');

  const cases: Array<[string, boolean]> = [
    ['http://example.com/a.png', false],
    ['https://127.0.0.1/a.png', false],
    ['https://localhost/a.png', false],
    ['https://169.254.169.254/latest/meta-data/', false],
    ['https://user:pass@example.com/a.png', false],
    ['https://8.8.8.8/a.png', true],
  ];

  for (const [url, ok] of cases) {
    const result = await assertPublicHttpUrl(url);
    if (result.ok !== ok) {
      throw new Error(`${url} expected ok=${ok} got ${JSON.stringify(result)}`);
    }
  }

  console.log('publicHttpUrl checks passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
