import { NextRequest, NextResponse } from 'next/server';

export function verifyCronSecret(request: NextRequest): NextResponse | null {
  const secret = process.env.TICKET_MONITOR_CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { success: false, error: 'TICKET_MONITOR_CRON_SECRET is not configured' },
      { status: 503 },
    );
  }

  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (token !== secret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

export function verifyAdminToken(request: NextRequest): NextResponse | null {
  const required = process.env.TICKET_MONITOR_ADMIN_TOKEN?.trim();
  if (!required) {
    return null;
  }

  const headerToken = request.headers.get('x-ticket-monitor-admin-token')?.trim()
    || (request.headers.get('authorization')?.startsWith('Bearer ')
      ? request.headers.get('authorization')!.slice(7).trim()
      : '');

  if (headerToken !== required) {
    return NextResponse.json({ success: false, error: 'Admin token required' }, { status: 401 });
  }

  return null;
}

export function isMaskedValue(value: string | null | undefined): boolean {
  return Boolean(value && value.includes('****'));
}
