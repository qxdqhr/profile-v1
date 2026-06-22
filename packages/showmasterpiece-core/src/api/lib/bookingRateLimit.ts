import { NextRequest, NextResponse } from 'next/server';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

/** 进程内滑动窗口限流（多实例部署时按实例独立计数，仍优于无限流） */
const WINDOW_MS = 60_000;
const LIMITS = {
  create: 30,
  batch: 10,
} as const;

export type BookingWriteScope = keyof typeof LIMITS;

function pruneExpired(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}

function consume(key: string, limit: number, now: number): boolean {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/**
 * 公开写接口限流。返回 429 响应表示应中止；返回 null 表示通过。
 */
export function enforceBookingWriteRateLimit(
  request: NextRequest,
  scope: BookingWriteScope,
  extraKey?: string,
): NextResponse | null {
  const now = Date.now();
  pruneExpired(now);

  const limit = LIMITS[scope];
  const ip = getClientIp(request);
  const keys = [`${scope}:ip:${ip}`];
  if (extraKey) {
    keys.push(`${scope}:cred:${extraKey}`);
  }

  for (const key of keys) {
    if (!consume(key, limit, now)) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(WINDOW_MS / 1000)) },
        },
      );
    }
  }

  return null;
}
