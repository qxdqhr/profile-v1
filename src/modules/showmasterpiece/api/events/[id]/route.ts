/**
 * ShowMasterpiece 特定活动管理 API
 * 
 * 提供特定活动的获取、更新、删除功能。
 * 
 * 路由: /api/showmasterpiece/events/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { 
  showmasterEvents, 
  showmasterEventConfigs,
  comicUniverseCategories,
  comicUniverseTags,
  comicUniverseCollections 
} from '@/db/schema';
import { eq } from 'drizzle-orm';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/showmasterpiece/events/[id]
 * 获取特定活动信息
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const eventId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const includeConfig = searchParams.get('includeConfig') === 'true';
    const includeStats = searchParams.get('includeStats') === 'true';

    console.log('📋 [活动API] 获取活动详情:', { eventId, includeConfig, includeStats });

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

    // 获取活动基本信息
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

    const event = events[0];
    let result: any = { ...event };

    // 如果需要包含配置信息
    if (includeConfig) {
      const configs = await db.select()
        .from(showmasterEventConfigs)
        .where(eq(showmasterEventConfigs.eventId, eventId))
        .limit(1);

      result.config = configs[0] || null;
    }

    // 如果需要包含统计信息
    if (includeStats) {
      const [categories, tags, collections] = await Promise.all([
        db.select()
          .from(comicUniverseCategories)
          .where(eq(comicUniverseCategories.eventId, eventId)),
        db.select()
          .from(comicUniverseTags)
          .where(eq(comicUniverseTags.eventId, eventId)),
        db.select()
          .from(comicUniverseCollections)
          .where(eq(comicUniverseCollections.eventId, eventId)),
      ]);

      result.stats = {
        categoriesCount: categories.length,
        tagsCount: tags.length,
        collectionsCount: collections.length,
        publishedCollectionsCount: collections.filter(c => c.isPublished).length
      };
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ [活动API] 获取活动详情失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取活动详情失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/showmasterpiece/events/[id]
 * 更新活动信息
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const eventId = parseInt(id);
    const body = await request.json();

    console.log('✏️ [活动API] 更新活动:', { eventId, body });

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
    const existingEvents = await db.select()
      .from(showmasterEvents)
      .where(eq(showmasterEvents.id, eventId))
      .limit(1);

    if (existingEvents.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '活动不存在',
          details: `ID为 ${eventId} 的活动不存在`
        },
        { status: 404 }
      );
    }

    // 如果更新slug，检查是否与其他活动重复
    if (body.slug) {
      const duplicateEvents = await db.select()
        .from(showmasterEvents)
        .where(eq(showmasterEvents.slug, body.slug))
        .limit(1);

      if (duplicateEvents.length > 0 && duplicateEvents[0].id !== eventId) {
        return NextResponse.json(
          { 
            success: false, 
            error: '活动标识符已存在',
            details: `标识符 "${body.slug}" 已被其他活动使用`
          },
          { status: 409 }
        );
      }
    }

    // 如果设置为默认活动，先将其他活动的默认状态取消
    if (body.isDefault === true) {
      await db.update(showmasterEvents)
        .set({ isDefault: false })
        .where(eq(showmasterEvents.isDefault, true));
    }

    // 准备更新数据
    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isDefault !== undefined) updateData.isDefault = body.isDefault;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    if (body.config !== undefined) updateData.config = body.config;

    // 更新活动
    const [updatedEvent] = await db.update(showmasterEvents)
      .set(updateData)
      .where(eq(showmasterEvents.id, eventId))
      .returning();

    console.log('✅ [活动API] 活动更新成功:', updatedEvent.id);

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: '活动更新成功'
    });

  } catch (error) {
    console.error('❌ [活动API] 更新活动失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '更新活动失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/showmasterpiece/events/[id]
 * 删除活动（谨慎操作）
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const eventId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true'; // 强制删除标志

    console.log('🗑️ [活动API] 删除活动:', { eventId, force });

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
    const existingEvents = await db.select()
      .from(showmasterEvents)
      .where(eq(showmasterEvents.id, eventId))
      .limit(1);

    if (existingEvents.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '活动不存在',
          details: `ID为 ${eventId} 的活动不存在`
        },
        { status: 404 }
      );
    }

    const event = existingEvents[0];

    // 检查是否为默认活动
    if (event.isDefault && !force) {
      return NextResponse.json(
        { 
          success: false, 
          error: '无法删除默认活动',
          details: '默认活动不能被删除，请先设置其他活动为默认活动，或使用 force=true 强制删除'
        },
        { status: 403 }
      );
    }

    // 检查是否有关联数据
    if (!force) {
      const [categories, tags, collections] = await Promise.all([
        db.select()
          .from(comicUniverseCategories)
          .where(eq(comicUniverseCategories.eventId, eventId)),
        db.select()
          .from(comicUniverseTags)
          .where(eq(comicUniverseTags.eventId, eventId)),
        db.select()
          .from(comicUniverseCollections)
          .where(eq(comicUniverseCollections.eventId, eventId)),
      ]);

      const totalRelatedData = categories.length + tags.length + collections.length;

      if (totalRelatedData > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: '活动包含关联数据',
            details: `该活动包含 ${totalRelatedData} 条关联数据（分类、标签、画集），删除会同时删除这些数据。如需强制删除，请使用 force=true 参数`,
            relatedData: {
              categories: categories.length,
              tags: tags.length,
              collections: collections.length
            }
          },
          { status: 409 }
        );
      }
    }

    // 删除活动（级联删除会自动处理关联数据）
    await db.delete(showmasterEvents)
      .where(eq(showmasterEvents.id, eventId));

    console.log('✅ [活动API] 活动删除成功:', eventId);

    return NextResponse.json({
      success: true,
      message: '活动删除成功',
      deletedEventId: eventId
    });

  } catch (error) {
    console.error('❌ [活动API] 删除活动失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '删除活动失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
