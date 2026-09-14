import { NextResponse } from 'next/server';
import { fetchExamTypes } from '@/modules/exam/server';

/**
 * GET /api/exam/types — 宿主薄转发 → `modules/exam/server` → sa2kit exam
 */
export async function GET() {
  try {
    const examTypes = await fetchExamTypes();
    return NextResponse.json({ examTypes }, { status: 200 });
  } catch (error) {
    console.error('获取考试类型失败:', error);
    return NextResponse.json(
      { error: '获取考试类型失败' },
      { status: 500 }
    );
  }
} 