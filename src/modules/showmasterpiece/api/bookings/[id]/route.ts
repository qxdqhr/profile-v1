/**
 * ShowMasterpiece — 单条预订
 * GET: 管理员，或 query/body 带匹配 QQ+手机
 * PUT: 仅管理员
 * DELETE: 管理员，或凭证匹配的本人（宿主二次校验后删单）
 */

import { NextRequest, NextResponse } from 'next/server';
import type { UpdateBookingRequest } from 'sa2kit/showmasterpiece';
import { BookingCommandError } from 'sa2kit/showmasterpiece/server';
import { isAdminUser, isAuthFailure, requireAdmin } from '../../lib/auth';
import { bookingMatchesLookup } from '../../lib/bookingAccess';
import {
  deleteBookingWithCredentialGuard,
  isBookingDeleteUnauthorized,
} from '../../lib/bookingDelete';
import {
  parseBookingCredentials,
  parseBookingCredentialsFromQuery,
} from '../../lib/bookingCredentials';
import {
  bookingCommandService,
  bookingQueryService,
} from '../../lib/bookingServices';
import { apiData, apiError, logRouteError } from '../../lib/response';
import { validateApiAuth } from '@/lib/auth/legacy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    if (Number.isNaN(id)) {
      return apiError('无效的预订ID', 400);
    }

    const booking = await bookingQueryService.getBookingById(id);
    if (!booking) {
      return apiError('预订不存在', 404);
    }

    const user = await validateApiAuth(request);
    if (isAdminUser(user)) {
      return NextResponse.json(booking);
    }

    const credentials = parseBookingCredentialsFromQuery(request);
    if (
      !credentials ||
      !bookingMatchesLookup(booking, credentials.qqNumber, credentials.phoneNumber)
    ) {
      return apiError('未授权的访问', 401);
    }

    const { adminNotes: _adminNotes, ...publicBooking } = booking as Record<
      string,
      unknown
    >;
    return NextResponse.json(publicBooking);
  } catch (error) {
    logRouteError('获取预订详情失败:', error);
    return apiError('获取预订详情失败', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    if (Number.isNaN(id)) {
      return apiError('无效的预订ID', 400);
    }

    const body: UpdateBookingRequest = await request.json();
    const updatedBooking = await bookingCommandService.updateBooking(id, body);
    return NextResponse.json(updatedBooking);
  } catch (error) {
    if (error instanceof BookingCommandError) {
      const status = error.code === 'BOOKING_NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    logRouteError('更新预订失败:', error);
    return apiError('更新预订失败', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    if (Number.isNaN(id)) {
      return apiError('无效的预订ID', 400);
    }

    const user = await validateApiAuth(request);
    const isAdmin = isAdminUser(user);
    const credentials = isAdmin ? null : await parseBookingCredentials(request);

    if (!isAdmin && !credentials) {
      return apiError('删除预订请同时提供匹配的 QQ 号与手机号', 401);
    }

    await deleteBookingWithCredentialGuard(id, { isAdmin, credentials });

    return apiData({ message: '预订删除成功', bookingId: id });
  } catch (error) {
    if (error instanceof BookingCommandError) {
      if (isBookingDeleteUnauthorized(error)) {
        return apiError(error.message, 401);
      }
      const status = error.code === 'BOOKING_NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    logRouteError('删除预订失败:', error);
    return apiError('删除预订失败', 500);
  }
}
