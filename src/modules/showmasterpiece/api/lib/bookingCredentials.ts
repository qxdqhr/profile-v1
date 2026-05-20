import type { NextRequest } from 'next/server';

export interface BookingCredentials {
  qqNumber: string;
  phoneNumber: string;
}

export function parseBookingCredentialsFromQuery(
  request: NextRequest,
): BookingCredentials | null {
  const { searchParams } = new URL(request.url);
  const qqNumber = searchParams.get('qqNumber')?.trim() ?? '';
  const phoneNumber = searchParams.get('phoneNumber')?.trim() ?? '';
  if (qqNumber && phoneNumber) {
    return { qqNumber, phoneNumber };
  }
  return null;
}

/** query 优先；否则尝试 JSON body（用于 DELETE 等） */
export async function parseBookingCredentials(
  request: NextRequest,
): Promise<BookingCredentials | null> {
  const fromQuery = parseBookingCredentialsFromQuery(request);
  if (fromQuery) return fromQuery;

  try {
    const body = await request.json();
    if (body && typeof body === 'object') {
      const qqNumber = String(body.qqNumber ?? '').trim();
      const phoneNumber = String(body.phoneNumber ?? '').trim();
      if (qqNumber && phoneNumber) {
        return { qqNumber, phoneNumber };
      }
    }
  } catch {
    // 无 body
  }

  return null;
}
