/**
 * ShowMasterpiece — 预订列表 / 创建
 */

import { NextRequest, NextResponse } from 'next/server';
import type { CreateBookingRequest, BookingListParams } from '@/modules/showmasterpiece/types/booking';
import { BookingCommandError } from '@/modules/showmasterpiece/server';
import { isAdminUser } from '../lib/auth';
import { validatePublicBookingLookup } from '../lib/bookingAccess';
import {
  bookingCommandService,
  bookingQueryService,
} from '../lib/bookingServices';
import { enforceBookingWriteRateLimit } from '../lib/bookingRateLimit';
import { apiError, logRouteError } from '../lib/response';
import { validateApiAuth } from '@/lib/auth/legacy';

function credentialKey(qqNumber: string, phoneNumber: string): string {
  return `${qqNumber}:${phoneNumber}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params: BookingListParams = {
      collectionId: searchParams.get('collectionId')
        ? parseInt(searchParams.get('collectionId')!, 10)
        : undefined,
      qqNumber: searchParams.get('qqNumber') || undefined,
      phoneNumber: searchParams.get('phoneNumber') || undefined,
      status: (searchParams.get('status') as BookingListParams['status']) || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
    };

    const user = await validateApiAuth(request);
    if (isAdminUser(user)) {
      const result = await bookingQueryService.getBookingsList(params);
      return NextResponse.json(result);
    }

    const lookupError = validatePublicBookingLookup(params);
    if (lookupError) {
      return apiError(lookupError, 400);
    }

    const result = await bookingQueryService.getBookingsList(params);
    return NextResponse.json(result);
  } catch (error) {
    logRouteError('获取预订列表失败:', error);
    return apiError('获取预订列表失败', 500);
  }
}

export async function POST(request: NextRequest) {
  const ipLimited = enforceBookingWriteRateLimit(request, 'create');
  if (ipLimited) return ipLimited;

  try {
    const body: CreateBookingRequest = await request.json();
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

    const result = await bookingCommandService.createBooking(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof BookingCommandError) {
      const status = error.code === 'COLLECTION_NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    logRouteError('创建预订失败:', error);
    return apiError('创建预订失败', 500);
  }
}
