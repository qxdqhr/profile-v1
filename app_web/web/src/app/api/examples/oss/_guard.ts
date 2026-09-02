import type { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/api-guard';
import { examplesBlockedInProduction } from '@/lib/examples/guard';

export async function requireOssExampleAdmin(request: NextRequest): Promise<NextResponse | null> {
  const blocked = examplesBlockedInProduction();
  if (blocked) return blocked;
  const gated = await requireAdminSession(request);
  return gated.error ?? null;
}
