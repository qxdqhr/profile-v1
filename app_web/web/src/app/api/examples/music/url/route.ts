import type { NextRequest } from 'next/server';
import { createSongUrlHandler } from 'sa2kit/business/music/server';
import { requireExampleAccess } from '@/lib/examples/guard';

const handler = createSongUrlHandler();

export async function GET(request: NextRequest) {
  const gated = await requireExampleAccess(request);
  if (gated.error) return gated.error;
  return handler(request);
}
