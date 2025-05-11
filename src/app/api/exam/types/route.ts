import { NextResponse } from 'next/server';
import { getAllExamTypes } from '../../../../db/services/exam-service';

/**
 * 获取所有考试类型
 */
export async function GET() {
  try {
    const examTypes = await getAllExamTypes();
    return NextResponse.json({ examTypes }, { status: 200 });
  } catch (error) {
    console.error('获取考试类型失败:', error);
    return NextResponse.json(
      { error: '获取考试类型失败' },
      { status: 500 }
    );
  }
} 