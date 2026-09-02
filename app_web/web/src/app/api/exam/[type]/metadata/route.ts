import { NextResponse } from 'next/server';
import { fetchExamMetadata } from '@/modules/exam/server';

/**
 * 获取考试元数据
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    
    if (!type) {
      return NextResponse.json(
        { error: '请提供考试类型' },
        { status: 400 }
      );
    }
    
    const metadata = await fetchExamMetadata(type);
    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error(`获取考试元数据失败:`, error);
    return NextResponse.json(
      { error: '获取考试元数据失败' },
      { status: 500 }
    );
  }
} 