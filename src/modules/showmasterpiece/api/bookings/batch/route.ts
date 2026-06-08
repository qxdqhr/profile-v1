/**
 * ShowMasterpiece — 批量预订（小程序/购物车）
 * 公开接口：限流 + 请求体校验 + 单次条数上限
 */

import { NextRequest, NextResponse } from 'next/server';
import { BookingCommandError } from '@/modules/showmasterpiece/server';
import { bookingCommandService } from '../../lib/bookingServices';
import { enforceBookingWriteRateLimit } from '../../lib/bookingRateLimit';
import { apiError, logRouteError } from '../../lib/response';

const MAX_BATCH_ITEMS = 50;

function credentialKey(qqNumber: string, phoneNumber: string): string {
  return `${qqNumber}:${phoneNumber}`;
}

async function POST(request: NextRequest) {
  const ipLimited = enforceBookingWriteRateLimit(request, 'batch');
  if (ipLimited) return ipLimited;

  try {
    const body = await request.json();
    const qqNumber = String(body?.qqNumber ?? '').trim();
    const phoneNumber = String(body?.phoneNumber ?? '').trim();
    const items = body?.items;

    if (!qqNumber || !phoneNumber || !Array.isArray(items) || items.length === 0) {
      return apiError('缺少必要参数：QQ 号、手机号、预订项列表', 400);
    }

    if (items.length > MAX_BATCH_ITEMS) {
      return apiError(`单次批量预订最多 ${MAX_BATCH_ITEMS} 项`, 400);
    }

    const credLimited = enforceBookingWriteRateLimit(
      request,
      'batch',
      credentialKey(qqNumber, phoneNumber),
    );
    if (credLimited) return credLimited;

    const result = await bookingCommandService.batchCreateBookings(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof BookingCommandError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    logRouteError('批量预订失败:', error);
    return apiError('批量预订失败', 500);
  }
}

export { POST };
