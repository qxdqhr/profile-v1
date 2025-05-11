import { NextResponse } from 'next/server';
import { getExamQuestions } from '../../../../../db/services/exam-service';

/**
 * 获取考试问题
 */
export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const type = params.type;
    
    if (!type) {
      return NextResponse.json(
        { error: '请提供考试类型' },
        { status: 400 }
      );
    }
    
    const questions = await getExamQuestions(type);
    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error(`获取考试问题失败:`, error);
    return NextResponse.json(
      { error: '获取考试问题失败' },
      { status: 500 }
    );
  }
} 