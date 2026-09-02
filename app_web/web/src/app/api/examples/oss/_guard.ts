import type { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/api-guard';

export async function requireOssExampleAdmin(request: NextRequest): Promise<NextResponse | null> {
  const gated = await requireAdminSession(request);
  return gated.error ?? null;
}
