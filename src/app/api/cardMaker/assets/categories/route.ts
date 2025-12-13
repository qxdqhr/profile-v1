import { NextRequest, NextResponse } from 'next/server';
import { CardMakerDbService } from '@/modules/cardMaker/db/cardMakerDbService';

// 强制动态渲染,避免构建时静态生成超时
export const dynamic = 'force-dynamic';
export const revalidate = false;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const categories = await CardMakerDbService.getDistinctCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}