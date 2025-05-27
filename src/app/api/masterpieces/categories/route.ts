import { NextResponse } from 'next/server';
import { categoriesDbService } from '@/db/services/masterpiecesDbService';

export async function GET() {
  try {
    const categories = await categoriesDbService.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    );
  }
} 