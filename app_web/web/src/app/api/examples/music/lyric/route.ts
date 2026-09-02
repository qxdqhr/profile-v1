import type { NextRequest } from 'next/server';
import { createLyricHandler } from 'sa2kit/business/music/server';
import { requireExampleAccess } from '@/lib/examples/guard';

const handler = createLyricHandler();

export async function GET(request: NextRequest) {
  const gated = await requireExampleAccess(request);
  if (gated.error) return gated.error;
  return handler(request);
}
