import { NextRequest, NextResponse } from 'next/server';
import { categoriesDbService } from '@/modules/showmasterpiece/masterpiecesDbService';
import { isAuthFailure, requireAdmin } from '../lib/auth';
import { logRouteError, apiError } from '../lib/response';

import { routeDebug } from '../lib/routeLog';

export async function GET() {
  try {
    routeDebug('📋 [分类API] 获取分类列表');

    const categories = await categoriesDbService.getCategories();
    
    routeDebug(`✅ [分类API] 获取到 ${categories.length} 个分类`);
    
    return NextResponse.json({
      success: true,
      data: categories,
      total: categories.length
    });
  } catch (error) {
    logRouteError('获取分类失败:', error);
    return apiError('获取分类失败', 500);
  }
} 

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthFailure(auth)) return auth;

    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';

    if (!name) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: '分类展示文案不能为空' }, { status: 400 });
    }

    await categoriesDbService.createCategory(name, description);
    return NextResponse.json({ success: true });
  } catch (error) {
    logRouteError('创建分类失败:', error);
    return apiError('创建分类失败', 500);
  }
}
