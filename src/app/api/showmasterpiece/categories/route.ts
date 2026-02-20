import { NextRequest, NextResponse } from 'next/server';
import { categoriesDbService } from'sa2kit/showmasterpiece/server';
import { validateApiAuth } from '@/modules/auth/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log('📋 [分类API] 获取分类列表');

    const categories = await categoriesDbService.getCategories();
    
    console.log(`✅ [分类API] 获取到 ${categories.length} 个分类`);
    
    return NextResponse.json({
      success: true,
      data: categories,
      total: categories.length
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    );
  }
} 

export async function POST(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : undefined;

    if (!name) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 });
    }

    await categoriesDbService.createCategory(name, description);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json(
      { error: '创建分类失败' },
      { status: 500 }
    );
  }
}
