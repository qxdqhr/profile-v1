import { NextRequest, NextResponse } from 'next/server';
import { sendContactNotifications } from '../../server/sendContactNotifications';
import { checkRateLimit } from '../../server/rateLimit';
import {
  validateContactPayload,
  type ContactRequestBody,
} from '../../server/validateContactPayload';

function getClientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim();
  }

  const realIp = request.headers.get('x-real-ip');
  return realIp?.trim() || undefined;
}

export async function POST(request: NextRequest) {
  let body: ContactRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: '请求体必须是 JSON' },
      { status: 400 },
    );
  }

  const validated = validateContactPayload(body);
  if (!validated.ok) {
    if ('honeypot' in validated) {
      return NextResponse.json({
        success: true,
        data: { submittedAt: new Date().toISOString(), channels: { feishu: 'skipped', qq: 'skipped' } },
      });
    }

    return NextResponse.json(
      { success: false, error: validated.error },
      { status: 400 },
    );
  }

  const clientIp = getClientIp(request);
  const rateKey = `home-contact:${clientIp || 'unknown'}`;
  const rate = checkRateLimit(rateKey);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `提交过于频繁，请 ${rate.retryAfterSec} 秒后再试`,
      },
      { status: 429 },
    );
  }

  const submittedAt = new Date().toISOString();
  const result = await sendContactNotifications({
    ...validated.data,
    submittedAt,
    clientIp,
  });

  if (!result.ok) {
    const status = result.errors.some((error) => error.includes('未配置'))
      ? 503
      : 502;

    return NextResponse.json(
      {
        success: false,
        error: result.errors[0] || '通知发送失败，请稍后重试',
        data: { channels: result.channels },
      },
      { status },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      submittedAt,
      channels: result.channels,
    },
  });
}
