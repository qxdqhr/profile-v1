import { NapCatClient, createNextNapCatRouteHandler } from 'sa2kit/business/qqbot/server';
import type { NextRequest } from 'next/server';
import { notFoundJson } from '@/lib/auth/api-guard';

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

function productionBlocked() {
  if (process.env.NODE_ENV === 'production') {
    return notFoundJson();
  }
  return null;
}

export async function GET(request: NextRequest) {
  const blocked = productionBlocked();
  if (blocked) return blocked;
  return handler(request);
}

export async function POST(request: NextRequest) {
  const blocked = productionBlocked();
  if (blocked) return blocked;
  return handler(request);
}

