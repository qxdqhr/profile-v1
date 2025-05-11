import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../db';
import { examTypes } from '../../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { getFullExamConfig, saveFullExamConfig } from '../../../../../../db/services/exam-service';

// GET 请求 - 获取配置数据
export async function GET(request: NextRequest) {
  try {
    // 从查询字符串获取试卷类型
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'default';
    
    // 先检查考试类型是否存在
    const typeExists = await db
      .select()
      .from(examTypes)
      .where(eq(examTypes.id, type));
    
    if (typeExists.length === 0) {
      return NextResponse.json(
        { error: `试卷类型 ${type} 不存在` },
        { status: 404 }
      );
    }
    
    // 获取完整配置（包括问题、启动页和结果页）
    const fullConfig = await getFullExamConfig(type);
    
    return NextResponse.json(fullConfig);
  } catch (error) {
    console.error('获取考试配置失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// POST 请求 - 保存配置数据
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 从查询字符串获取试卷类型
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'default';
    
    // 检查考试类型是否存在
    const typeExists = await db
      .select()
      .from(examTypes)
      .where(eq(examTypes.id, type));
    
    if (typeExists.length === 0) {
      return NextResponse.json(
        { error: `试卷类型 ${type} 不存在` },
        { status: 404 }
      );
    }
    
    // 保存完整配置（问题、启动页和结果页）
    await saveFullExamConfig(type, data);
    
    return NextResponse.json({ 
      success: true,
      message: `试卷类型 ${type} 的配置已保存`,
      questionsCount: data.questions?.length || 0
    });
  } catch (error) {
    console.error('保存考试配置失败:', error);
    return NextResponse.json(
      { error: '保存失败' },
      { status: 500 }
    );
  }
} 