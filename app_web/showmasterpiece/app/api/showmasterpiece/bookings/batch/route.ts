/**
 * 批量预订（限流后调 sa2kit handler）
 */
import { createBatchCreateBookingsHandler } from 'sa2kit/business/showmasterpiece/routes';
import { createBookingHostRouteConfig } from '@lib/bookingHostRouteConfig';
import { enforceBookingWriteRateLimit } from '@lib/bookingRateLimit';

const config = createBookingHostRouteConfig();
const batchCreate = createBatchCreateBookingsHandler(config);

function credentialKey(qqNumber: string, phoneNumber: string): string {
  return `${qqNumber}:${phoneNumber}`;
}

export async function POST(request: Request) {
  const ipLimited = enforceBookingWriteRateLimit(request, 'batch');
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
        'batch',
        credentialKey(qq, phone),
      );
      if (credLimited) return credLimited;
    }
  } catch {
    // continue
  }

  return batchCreate(request);
}
