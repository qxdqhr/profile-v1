/**
 * ShowMasterpiece 活动管理 API
 * 
 * 提供活动的增删改查功能，支持多期活动管理。
 * 
 * 路由: /api/showmasterpiece/events
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { showmasterEvents, showmasterEventConfigs } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

/**
 * GET /api/showmasterpiece/events
 * 获取所有活动列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 按状态筛选
    const includeConfig = searchParams.get('includeConfig') === 'true'; // 是否包含配置信息

    console.log('📋 [活动API] 获取活动列表', { status, includeConfig });

    // 获取活动列表
    const events = status 
      ? await db.select()
          .from(showmasterEvents)
          .where(eq(showmasterEvents.status, status))
          .orderBy(desc(showmasterEvents.sortOrder), desc(showmasterEvents.createdAt))
      : await db.select()
          .from(showmasterEvents)
          .orderBy(desc(showmasterEvents.sortOrder), desc(showmasterEvents.createdAt));

    // 如果需要包含配置信息
    if (includeConfig) {
      const eventsWithConfig = await Promise.all(
        events.map(async (event) => {
          const configs = await db.select()
            .from(showmasterEventConfigs)
            .where(eq(showmasterEventConfigs.eventId, event.id))
            .limit(1);

          return {
            ...event,
            config: configs[0] || null
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: eventsWithConfig,
        total: eventsWithConfig.length
      });
    }

    return NextResponse.json({
      success: true,
      data: events,
      total: events.length
    });

  } catch (error) {
    console.error('❌ [活动API] 获取活动列表失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取活动列表失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/showmasterpiece/events
 * 创建新活动
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 [活动API] 创建新活动:', body);

    // 验证必填字段
    const { name, slug, displayName } = body;
    if (!name || !slug || !displayName) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少必填字段',
          details: '活动名称、标识符和显示名称不能为空'
        },
        { status: 400 }
      );
    }

    // 检查slug是否已存在
    const existingEvent = await db.select()
      .from(showmasterEvents)
      .where(eq(showmasterEvents.slug, slug))
      .limit(1);

    if (existingEvent.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '活动标识符已存在',
          details: `标识符 "${slug}" 已被使用，请选择其他标识符`
        },
        { status: 409 }
      );
    }

    // 如果设置为默认活动，先将其他活动的默认状态取消
    if (body.isDefault) {
      await db.update(showmasterEvents)
        .set({ isDefault: false })
        .where(eq(showmasterEvents.isDefault, true));
    }

    // 创建活动
    const [newEvent] = await db.insert(showmasterEvents).values({
      name,
      slug,
      displayName,
      description: body.description || null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      status: body.status || 'draft',
      isDefault: body.isDefault || false,
      sortOrder: body.sortOrder || 0,
      config: body.config || null,
    }).returning();

    // 创建默认配置
    if (body.createDefaultConfig !== false) {
      const defaultConfig = body.defaultConfig || {};
      
      await db.insert(showmasterEventConfigs).values({
        eventId: newEvent.id,
        siteName: defaultConfig.siteName || '画集展览',
        siteDescription: defaultConfig.siteDescription || '精美的艺术作品展览',
        heroTitle: defaultConfig.heroTitle || '艺术画集展览',
        heroSubtitle: defaultConfig.heroSubtitle || '探索精美的艺术作品，感受创作的魅力',
        maxCollectionsPerPage: defaultConfig.maxCollectionsPerPage || 9,
        enableSearch: defaultConfig.enableSearch !== false,
        enableCategories: defaultConfig.enableCategories !== false,
        defaultCategory: defaultConfig.defaultCategory || 'all',
        theme: defaultConfig.theme || 'light',
        language: defaultConfig.language || 'zh',
      });
    }

    console.log('✅ [活动API] 活动创建成功:', newEvent.id);

    return NextResponse.json({
      success: true,
      data: newEvent,
      message: '活动创建成功'
    });

  } catch (error) {
    console.error('❌ [活动API] 创建活动失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '创建活动失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
