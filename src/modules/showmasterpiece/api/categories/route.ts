import { NextResponse } from 'next/server';
import { getAvailableCategories } from '../../types';

export async function GET() {
  try {
    // 返回预定义的分类枚举值
    const categories = getAvailableCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    );
  }
} 