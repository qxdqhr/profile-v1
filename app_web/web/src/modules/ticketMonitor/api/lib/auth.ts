import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';

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

/**
 * Admin mutating ops: require configured admin token when set;
 * otherwise fall back to logged-in session (never open when unset).
 */
export async function requireTicketAdmin(request: NextRequest): Promise<NextResponse | null> {
  const required = process.env.TICKET_MONITOR_ADMIN_TOKEN?.trim();
  if (required) {
    const headerToken = request.headers.get('x-ticket-monitor-admin-token')?.trim()
      || (request.headers.get('authorization')?.startsWith('Bearer ')
        ? request.headers.get('authorization')!.slice(7).trim()
        : '');

    if (headerToken !== required) {
      return NextResponse.json({ success: false, error: 'Admin token required' }, { status: 401 });
    }
    return null;
  }

  const user = await getApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/** @deprecated Prefer requireTicketAdmin for mutating routes */
export function verifyAdminToken(request: NextRequest): NextResponse | null {
  const required = process.env.TICKET_MONITOR_ADMIN_TOKEN?.trim();
  if (!required) {
    return NextResponse.json(
      { success: false, error: 'TICKET_MONITOR_ADMIN_TOKEN is not configured; login required via requireTicketAdmin' },
      { status: 503 },
    );
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
