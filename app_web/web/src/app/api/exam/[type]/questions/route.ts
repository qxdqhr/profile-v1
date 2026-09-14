import { NextResponse } from 'next/server';
import { fetchExamQuestions } from '@/modules/exam/server';

/**
 * GET /api/exam/[type]/questions — 宿主薄转发 → `modules/exam/server` → sa2kit exam
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
    
    const questions = await fetchExamQuestions(type);
    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error(`获取考试问题失败:`, error);
    return NextResponse.json(
      { error: '获取考试问题失败' },
      { status: 500 }
    );
  }
} 