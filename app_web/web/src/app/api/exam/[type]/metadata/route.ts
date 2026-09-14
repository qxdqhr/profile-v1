import { NextResponse } from 'next/server';
import { fetchExamMetadata } from '@/modules/exam/server';

/**
 * GET /api/exam/[type]/metadata — 宿主薄转发 → `modules/exam/server` → sa2kit exam
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