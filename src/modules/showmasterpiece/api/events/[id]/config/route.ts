/**
 * ShowMasterpiece 活动配置管理 API
 * 
 * 提供活动特定配置的获取和更新功能。
 * 
 * 路由: /api/showmasterpiece/events/[id]/config
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { showmasterEvents, showmasterEventConfigs } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 强制动态渲染,避免构建时静态生成超时
export const dynamic = 'force-dynamic';
export const revalidate = false;
export const fetchCache = 'force-no-store';


interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/showmasterpiece/events/[id]/config
 * 获取活动配置
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const eventId = parseInt(context.params.id);
    
    console.log('📋 [活动配置API] 获取活动配置:', { eventId });

    if (isNaN(eventId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '无效的活动ID',
          details: '活动ID必须是有效的数字'
        },
        { status: 400 }
      );
    }

    // 检查活动是否存在
    const events = await db.select()
      .from(showmasterEvents)
      .where(eq(showmasterEvents.id, eventId))
      .limit(1);

    if (events.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '活动不存在',
          details: `ID为 ${eventId} 的活动不存在`
        },
        { status: 404 }
      );
    }

    // 获取活动配置
    const configs = await db.select()
      .from(showmasterEventConfigs)
      .where(eq(showmasterEventConfigs.eventId, eventId))
      .limit(1);

    if (configs.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '活动配置不存在',
          details: `活动 ${eventId} 的配置不存在，请先创建配置`
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: configs[0]
    });

  } catch (error) {
    console.error('❌ [活动配置API] 获取活动配置失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取活动配置失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/showmasterpiece/events/[id]/config
 * 更新活动配置
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const eventId = parseInt(context.params.id);
    const body = await request.json();
    
    console.log('✏️ [活动配置API] 更新活动配置:', { eventId, body });

    if (isNaN(eventId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '无效的活动ID',
          details: '活动ID必须是有效的数字'
        },
        { status: 400 }
      );
    }

    // 检查活动是否存在
    const events = await db.select()
      .from(showmasterEvents)
      .where(eq(showmasterEvents.id, eventId))
      .limit(1);

    if (events.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '活动不存在',
          details: `ID为 ${eventId} 的活动不存在`
        },
        { status: 404 }
      );
    }

    // 检查配置是否存在
    const existingConfigs = await db.select()
      .from(showmasterEventConfigs)
      .where(eq(showmasterEventConfigs.eventId, eventId))
      .limit(1);

    // 准备更新数据
    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.siteName !== undefined) updateData.siteName = body.siteName;
    if (body.siteDescription !== undefined) updateData.siteDescription = body.siteDescription;
    if (body.heroTitle !== undefined) updateData.heroTitle = body.heroTitle;
    if (body.heroSubtitle !== undefined) updateData.heroSubtitle = body.heroSubtitle;
    if (body.maxCollectionsPerPage !== undefined) updateData.maxCollectionsPerPage = body.maxCollectionsPerPage;
    if (body.enableSearch !== undefined) updateData.enableSearch = body.enableSearch;
    if (body.enableCategories !== undefined) updateData.enableCategories = body.enableCategories;
    if (body.defaultCategory !== undefined) updateData.defaultCategory = body.defaultCategory;
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.language !== undefined) updateData.language = body.language;

    let updatedConfig;

    if (existingConfigs.length === 0) {
      // 如果配置不存在，创建新配置
      console.log('📝 [活动配置API] 创建新配置');
      
      const insertData = {
        eventId,
        siteName: body.siteName || '画集展览',
        siteDescription: body.siteDescription || '精美的艺术作品展览',
        heroTitle: body.heroTitle || '艺术画集展览',
        heroSubtitle: body.heroSubtitle || '探索精美的艺术作品，感受创作的魅力',
        maxCollectionsPerPage: body.maxCollectionsPerPage || 9,
        enableSearch: body.enableSearch !== false,
        enableCategories: body.enableCategories !== false,
        defaultCategory: body.defaultCategory || 'all',
        theme: body.theme || 'light',
        language: body.language || 'zh',
      };

      [updatedConfig] = await db.insert(showmasterEventConfigs)
        .values(insertData)
        .returning();
    } else {
      // 如果配置存在，更新配置
      console.log('✏️ [活动配置API] 更新现有配置');
      
      [updatedConfig] = await db.update(showmasterEventConfigs)
        .set(updateData)
        .where(eq(showmasterEventConfigs.eventId, eventId))
        .returning();
    }

    console.log('✅ [活动配置API] 活动配置更新成功:', updatedConfig.id);

    return NextResponse.json({
      success: true,
      data: updatedConfig,
      message: '活动配置更新成功'
    });

  } catch (error) {
    console.error('❌ [活动配置API] 更新活动配置失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '更新活动配置失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/showmasterpiece/events/[id]/config
 * 创建活动配置
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const eventId = parseInt(context.params.id);
    const body = await request.json();
    
    console.log('📝 [活动配置API] 创建活动配置:', { eventId, body });

    if (isNaN(eventId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '无效的活动ID',
          details: '活动ID必须是有效的数字'
        },
        { status: 400 }
      );
    }

    // 检查活动是否存在
    const events = await db.select()
      .from(showmasterEvents)
      .where(eq(showmasterEvents.id, eventId))
      .limit(1);

    if (events.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '活动不存在',
          details: `ID为 ${eventId} 的活动不存在`
        },
        { status: 404 }
      );
    }

    // 检查配置是否已存在
    const existingConfigs = await db.select()
      .from(showmasterEventConfigs)
      .where(eq(showmasterEventConfigs.eventId, eventId))
      .limit(1);

    if (existingConfigs.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '活动配置已存在',
          details: `活动 ${eventId} 的配置已存在，请使用 PUT 方法更新配置`
        },
        { status: 409 }
      );
    }

    // 创建新配置
    const [newConfig] = await db.insert(showmasterEventConfigs).values({
      eventId,
      siteName: body.siteName || '画集展览',
      siteDescription: body.siteDescription || '精美的艺术作品展览',
      heroTitle: body.heroTitle || '艺术画集展览',
      heroSubtitle: body.heroSubtitle || '探索精美的艺术作品，感受创作的魅力',
      maxCollectionsPerPage: body.maxCollectionsPerPage || 9,
      enableSearch: body.enableSearch !== false,
      enableCategories: body.enableCategories !== false,
      defaultCategory: body.defaultCategory || 'all',
      theme: body.theme || 'light',
      language: body.language || 'zh',
    }).returning();

    console.log('✅ [活动配置API] 活动配置创建成功:', newConfig.id);

    return NextResponse.json({
      success: true,
      data: newConfig,
      message: '活动配置创建成功'
    });

  } catch (error) {
    console.error('❌ [活动配置API] 创建活动配置失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '创建活动配置失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
