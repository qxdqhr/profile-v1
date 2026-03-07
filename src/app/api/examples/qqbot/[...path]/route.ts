import { NapCatClient, createNextNapCatRouteHandler } from 'sa2kit/qqbot/server';

const client = new NapCatClient({
  baseUrl: process.env.NAPCAT_HTTP_URL || 'http://127.0.0.1:3000',
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

export const GET = handler;
export const POST = handler;
