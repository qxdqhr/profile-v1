/**
 * ShowMasterpiece 模块 - 可预订画集列表API路由
 * 
 * 获取可预订的画集列表，返回简略信息（包括价格）
 * 
 * @fileoverview 可预订画集列表API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { bookingQueryService } from '../../lib/bookingServices';
import { apiError, logRouteError } from '../../lib/response';

/**
 * 获取可预订的画集列表
 * 
 * @param request Next.js请求对象
 * @returns 画集简略信息列表
 */
async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析查询参数
    const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const orderBy = searchParams.get('orderBy') || 'displayOrder'; // displayOrder, createdAt, title

    const collections = await bookingQueryService.getBookableCollections({
      categoryId,
      limit,
      orderBy,
    });

    return NextResponse.json(collections);

  } catch (error) {
    logRouteError('获取可预订画集列表失败:', error);
    return apiError('获取画集列表失败', 500);
  }
}

export { GET }; 
