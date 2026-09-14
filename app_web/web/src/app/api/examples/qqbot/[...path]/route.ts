import { NapCatClient, createNextNapCatRouteHandler } from 'sa2kit/business/qqbot/server';
import type { NextRequest } from 'next/server';
import {
  examplesBlockedInProduction,
  requireExampleAccess,
} from '@/lib/examples/guard';

const client = new NapCatClient({
  // Default to NapCat common local HTTP port to avoid accidentally looping back to Next.js app (:3000).
  baseUrl: process.env.NAPCAT_HTTP_URL || 'http://127.0.0.1:3001',
  accessToken: process.env.NAPCAT_TOKEN,
  timeoutMs: Number(process.env.NAPCAT_TIMEOUT_MS || 12000),
});

const handler = createNextNapCatRouteHandler({
  client,
  basePath: '/api/examples/qqbot',
  onWebhookEvent(event) {
    console.log('[qqbot webhook]', event);
  },
});

function isWebhookPath(request: NextRequest) {
  const { pathname } = new URL(request.url);
  return pathname === '/api/examples/qqbot/webhook/event'
    || pathname.endsWith('/webhook/event');
}

export async function GET(request: NextRequest) {
  const gated = await requireExampleAccess(request);
  if (gated.error) return gated.error;
  return handler(request);
}

export async function POST(request: NextRequest) {
  // NapCat 回调无 session；生产仍 404。其它写操作需真 session。
  if (isWebhookPath(request)) {
    const blocked = examplesBlockedInProduction();
    if (blocked) return blocked;
    return handler(request);
  }

  const gated = await requireExampleAccess(request);
  if (gated.error) return gated.error;
  return handler(request);
}
