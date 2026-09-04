/**
 * ShowMasterpiece — 预订列表 / 创建
 */
import {
  createCreateBookingHandler,
  createListBookingsHandler,
} from 'sa2kit/business/showmasterpiece/routes';
import { createBookingHostRouteConfig } from '../lib/bookingHostRouteConfig';
import { enforceBookingWriteRateLimit } from '../lib/bookingRateLimit';

const config = createBookingHostRouteConfig();

export const GET = createListBookingsHandler(config);

const createBooking = createCreateBookingHandler(config);

function credentialKey(qqNumber: string, phoneNumber: string): string {
  return `${qqNumber}:${phoneNumber}`;
}

export async function POST(request: Request) {
  const ipLimited = enforceBookingWriteRateLimit(request, 'create');
  if (ipLimited) return ipLimited;

  try {
    const cloned = request.clone();
    const body = (await cloned.json()) as {
      qqNumber?: string;
      phoneNumber?: string;
    };
    const qq = String(body?.qqNumber ?? '').trim();
    const phone = String(body?.phoneNumber ?? '').trim();
    if (qq && phone) {
      const credLimited = enforceBookingWriteRateLimit(
        request,
        'create',
        credentialKey(qq, phone),
      );
      if (credLimited) return credLimited;
    }
  } catch {
    // body 解析失败时仍交给 handler
  }

  return createBooking(request);
}
