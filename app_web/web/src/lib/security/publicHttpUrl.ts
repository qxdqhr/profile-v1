import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const BLOCKED_HOSTS = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata.google.com',
  'metadata',
]);

function ipv4Octets(ip: string): number[] | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return nums;
}

export function isPrivateOrReservedIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    const o = ipv4Octets(ip);
    if (!o) return true;
    const [a, b] = o;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 192 && b === 0) return true;
    if (a >= 224) return true;
    return false;
  }
  if (version === 6) {
    const n = ip.toLowerCase();
    if (n === '::' || n === '::1') return true;
    if (n.startsWith('fe80:') || n.startsWith('fe80::')) return true;
    if (n.startsWith('fc') || n.startsWith('fd')) return true;
    if (n.startsWith('ff')) return true;
    if (n.startsWith('::ffff:')) {
      const mapped = n.slice('::ffff:'.length);
      return isPrivateOrReservedIp(mapped);
    }
    return false;
  }
  return true;
}

export type PublicHttpUrlCheck = { ok: true; url: URL } | { ok: false; error: string };

export async function assertPublicHttpUrl(
  raw: string,
  options?: { allowHttp?: boolean },
): Promise<PublicHttpUrlCheck> {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, error: '无效的图片URL' };
  }

  const allowHttp = options?.allowHttp === true;
  if (parsed.protocol !== 'https:' && !(allowHttp && parsed.protocol === 'http:')) {
    return { ok: false, error: '仅允许 https 图片地址' };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, error: '不允许带凭证的URL' };
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!hostname || BLOCKED_HOSTS.has(hostname) || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { ok: false, error: '不允许的主机名' };
  }

  if (/^\d+$/.test(hostname)) {
    return { ok: false, error: '不允许的主机名' };
  }

  const port = parsed.port;
  if (port && port !== '443' && !(allowHttp && port === '80')) {
    return { ok: false, error: '不允许的端口' };
  }

  const ipVersion = isIP(hostname);
  if (ipVersion) {
    if (isPrivateOrReservedIp(hostname)) {
      return { ok: false, error: '不允许访问内网地址' };
    }
    return { ok: true, url: parsed };
  }

  let addresses: Array<{ address: string }>;
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    return { ok: false, error: '无法解析图片主机名' };
  }

  if (!addresses.length || addresses.some((item) => isPrivateOrReservedIp(item.address))) {
    return { ok: false, error: '不允许访问内网地址' };
  }

  return { ok: true, url: parsed };
}
