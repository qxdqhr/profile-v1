/**
 * ShowMasterpiece 模块 - 预订API路由
 * 
 * 处理画集预订相关的HTTP请求，包括：
 * - GET: 获取预订列表
 * - POST: 创建新预订
 * 
 * @fileoverview 预订API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import type { CreateBookingRequest, BookingListParams } from 'sa2kit/showmasterpiece';
import {
  createBookingQueryService,
  createBookingCommandService,
  BookingCommandError,
} from 'sa2kit/showmasterpiece/server';

const bookingQueryService = createBookingQueryService(db);
const bookingCommandService = createBookingCommandService(db);

/**
 * 获取预订列表
 * 
 * @param request Next.js请求对象
 * @returns 预订列表和分页信息
 */
async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析查询参数
    const params: BookingListParams = {
      collectionId: searchParams.get('collectionId') ? parseInt(searchParams.get('collectionId')!) : undefined,
      qqNumber: searchParams.get('qqNumber') || undefined,
      phoneNumber: searchParams.get('phoneNumber') || undefined,
      status: searchParams.get('status') as any || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    };

    const result = await bookingQueryService.getBookingsList(params);
    return NextResponse.json(result);

  } catch (error) {
    console.error('获取预订列表失败:', error);
    return NextResponse.json(
      { message: '获取预订列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建新预订
 * 
 * @param request Next.js请求对象
 * @returns 创建的预订信息
 */
async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json();
    const result = await bookingCommandService.createBooking(body);
    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    if (error instanceof BookingCommandError) {
      const status =
        error.code === 'COLLECTION_NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ message: error.message }, { status });
    }

    console.error('创建预订失败:', error);
    return NextResponse.json(
      { message: '创建预订失败' },
      { status: 500 }
    );
  }
}

export { GET, POST }; 
