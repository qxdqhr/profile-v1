import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { examTypes, examMetadata, examQuestions, examStartScreens, examResultModals } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

// 标记为动态路由，防止静态生成
export const dynamic = 'force-dynamic';

// GET 请求 - 获取所有试卷类型
export async function GET(request: NextRequest) {
  try {
    // 从数据库获取所有考试类型
    const types = await db.select().from(examTypes);
    
    // 检查是否有详细信息的请求参数
    const { searchParams } = new URL(request.url);
    const withDetails = searchParams.get('details') === 'true';
    
    if (withDetails) {
      // 获取每个试卷类型的详细信息
      const detailsPromises = types.map(async (type) => {
        // 获取元数据
        const metadataResults = await db
          .select()
          .from(examMetadata)
          .where(eq(examMetadata.id, type.id));
        
        const metadata = metadataResults.length > 0 ? metadataResults[0] : {
          id: type.id,
          name: type.id,
          description: '',
          createdAt: new Date(),
          lastModified: new Date(),
        };
        
        // 获取问题数量
        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(examQuestions)
          .where(eq(examQuestions.examTypeId, type.id));
        
        const questionCount = countResult[0]?.count || 0;
        
        return {
          ...metadata,
          questionCount,
        };
      });
      
      const details = await Promise.all(detailsPromises);
      return NextResponse.json(details);
    }
    
    return NextResponse.json(types.map(t => t.id));
  } catch (error) {
    console.error('获取试卷类型失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// POST 请求 - 创建新试卷类型
export async function POST(request: NextRequest) {
  try {
    const { id, name, description } = await request.json();
    
    // 验证请求数据
    if (!id || !name) {
      return NextResponse.json(
        { error: '试卷ID和名称是必需的' },
        { status: 400 }
      );
    }
    
    // 验证ID格式
    if (!/^[a-z0-9_-]+$/.test(id)) {
      return NextResponse.json(
        { error: '试卷ID格式不正确，只能包含小写字母、数字、下划线和连字符' },
        { status: 400 }
      );
    }
    
    // 检查ID是否已存在
    const existingType = await db
      .select()
      .from(examTypes)
      .where(eq(examTypes.id, id));
    
    if (existingType.length > 0) {
      return NextResponse.json(
        { error: '此试卷ID已存在' },
        { status: 409 }
      );
    }
    
    // 创建事务，同时插入类型和元数据
    await db.transaction(async (tx) => {
      // 添加新试卷类型
      await tx.insert(examTypes).values({
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // 创建元数据
      await tx.insert(examMetadata).values({
        id,
        name,
        description: description || '',
        createdAt: new Date(),
        lastModified: new Date(),
      });
    });
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: `试卷类型 ${id} 已创建`,
      type: {
        id,
        name,
        description: description || '',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('创建试卷类型失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// DELETE 请求 - 删除试卷类型
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '试卷ID是必需的' },
        { status: 400 }
      );
    }
    
    // 系统默认试卷不允许删除
    if (id === 'default' || id === 'arknights') {
      return NextResponse.json(
        { error: '系统默认试卷不能删除' },
        { status: 403 }
      );
    }
    
    // 检查ID是否存在
    const existingType = await db
      .select()
      .from(examTypes)
      .where(eq(examTypes.id, id));
    
    if (existingType.length === 0) {
      return NextResponse.json(
        { error: '试卷类型不存在' },
        { status: 404 }
      );
    }
    
    // 创建事务，删除试卷类型、元数据和问题
    await db.transaction(async (tx) => {
      // 删除问题
      await tx.delete(examQuestions).where(eq(examQuestions.examTypeId, id));
      
      // 删除启动页配置
      await tx.delete(examStartScreens).where(eq(examStartScreens.id, id));
      
      // 删除结果页配置
      await tx.delete(examResultModals).where(eq(examResultModals.id, id));
      
      // 删除元数据
      await tx.delete(examMetadata).where(eq(examMetadata.id, id));
      
      // 删除类型
      await tx.delete(examTypes).where(eq(examTypes.id, id));
    });
    
    return NextResponse.json({
      success: true,
      message: `试卷类型 ${id} 已删除`
    });
  } catch (error) {
    console.error('删除试卷类型失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// PUT 请求 - 更新试卷类型元数据
export async function PUT(request: NextRequest) {
  try {
    const { id, name, description } = await request.json();
    
    if (!id || !name) {
      return NextResponse.json(
        { error: '试卷ID和名称是必需的' },
        { status: 400 }
      );
    }
    
    // 检查ID是否存在
    const existingType = await db
      .select()
      .from(examTypes)
      .where(eq(examTypes.id, id));
    
    if (existingType.length === 0) {
      return NextResponse.json(
        { error: '试卷类型不存在' },
        { status: 404 }
      );
    }
    
    // 更新元数据
    await db
      .update(examMetadata)
      .set({
        name,
        description: description || '',
        lastModified: new Date(),
      })
      .where(eq(examMetadata.id, id));
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: `试卷类型 ${id} 的元数据已更新`,
      type: {
        id,
        name,
        description: description || '',
        lastModified: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('更新试卷类型元数据失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
} 