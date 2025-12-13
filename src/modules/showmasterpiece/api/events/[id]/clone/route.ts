/**
 * ShowMasterpiece 活动克隆 API
 * 
 * 提供活动克隆功能，可以复制现有活动的配置和数据。
 * 
 * 路由: /api/showmasterpiece/events/[id]/clone
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { 
  showmasterEvents, 
  showmasterEventConfigs,
  comicUniverseCategories,
  comicUniverseTags,
  comicUniverseCollections,
  comicUniverseCollectionTags,
  comicUniverseArtworks
} from '@/db/schema';
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
 * POST /api/showmasterpiece/events/[id]/clone
 * 克隆活动
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const sourceEventId = parseInt(context.params.id);
    const body = await request.json();
    
    console.log('🔄 [活动API] 克隆活动:', { sourceEventId, body });

    if (isNaN(sourceEventId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '无效的活动ID',
          details: '源活动ID必须是有效的数字'
        },
        { status: 400 }
      );
    }

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

    // 检查源活动是否存在
    const sourceEvents = await db.select()
      .from(showmasterEvents)
      .where(eq(showmasterEvents.id, sourceEventId))
      .limit(1);

    if (sourceEvents.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '源活动不存在',
          details: `ID为 ${sourceEventId} 的活动不存在`
        },
        { status: 404 }
      );
    }

    // 检查新slug是否已存在
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

    const sourceEvent = sourceEvents[0];
    
    // 如果设置为默认活动，先将其他活动的默认状态取消
    if (body.isDefault) {
      await db.update(showmasterEvents)
        .set({ isDefault: false })
        .where(eq(showmasterEvents.isDefault, true));
    }

    // 创建新活动
    const [newEvent] = await db.insert(showmasterEvents).values({
      name,
      slug,
      displayName,
      description: body.description || sourceEvent.description,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      status: body.status || 'draft',
      isDefault: body.isDefault || false,
      sortOrder: body.sortOrder || 0,
      config: body.config || sourceEvent.config,
    }).returning();

    console.log('✅ [活动API] 新活动创建成功:', newEvent.id);

    // 克隆配置
    if (body.cloneConfig !== false) {
      const sourceConfigs = await db.select()
        .from(showmasterEventConfigs)
        .where(eq(showmasterEventConfigs.eventId, sourceEventId))
        .limit(1);

      if (sourceConfigs.length > 0) {
        const sourceConfig = sourceConfigs[0];
        await db.insert(showmasterEventConfigs).values({
          eventId: newEvent.id,
          siteName: sourceConfig.siteName,
          siteDescription: sourceConfig.siteDescription,
          heroTitle: sourceConfig.heroTitle,
          heroSubtitle: sourceConfig.heroSubtitle,
          maxCollectionsPerPage: sourceConfig.maxCollectionsPerPage,
          enableSearch: sourceConfig.enableSearch,
          enableCategories: sourceConfig.enableCategories,
          defaultCategory: sourceConfig.defaultCategory,
          theme: sourceConfig.theme,
          language: sourceConfig.language,
        });
        
        console.log('✅ [活动API] 配置克隆成功');
      }
    }

    // 克隆数据（可选）
    if (body.cloneData === true) {
      console.log('🔄 [活动API] 开始克隆数据...');

      // 克隆分类
      const sourceCategories = await db.select()
        .from(comicUniverseCategories)
        .where(eq(comicUniverseCategories.eventId, sourceEventId));

      const categoryMapping: Record<number, number> = {};
      
      for (const category of sourceCategories) {
        const [newCategory] = await db.insert(comicUniverseCategories).values({
          eventId: newEvent.id,
          name: category.name + '_clone',
          description: category.description,
          displayOrder: category.displayOrder,
          isActive: category.isActive,
        }).returning();
        
        categoryMapping[category.id] = newCategory.id;
      }

      console.log(`✅ [活动API] 克隆了 ${sourceCategories.length} 个分类`);

      // 克隆标签
      const sourceTags = await db.select()
        .from(comicUniverseTags)
        .where(eq(comicUniverseTags.eventId, sourceEventId));

      const tagMapping: Record<number, number> = {};
      
      for (const tag of sourceTags) {
        const [newTag] = await db.insert(comicUniverseTags).values({
          eventId: newEvent.id,
          name: tag.name + '_clone',
          color: tag.color,
          isActive: tag.isActive,
        }).returning();
        
        tagMapping[tag.id] = newTag.id;
      }

      console.log(`✅ [活动API] 克隆了 ${sourceTags.length} 个标签`);

      // 克隆画集（如果选择克隆画集）
      if (body.cloneCollections === true) {
        const sourceCollections = await db.select()
          .from(comicUniverseCollections)
          .where(eq(comicUniverseCollections.eventId, sourceEventId));

        for (const collection of sourceCollections) {
          // 创建新画集
          const [newCollection] = await db.insert(comicUniverseCollections).values({
            eventId: newEvent.id,
            title: collection.title + '_clone',
            number: collection.number + '_clone',
            coverImage: collection.coverImage,
            coverImageFileId: collection.coverImageFileId,
            description: collection.description,
            categoryId: collection.categoryId ? categoryMapping[collection.categoryId] || null : null,
            isPublished: false, // 克隆的画集默认为草稿状态
            publishedAt: null,
            displayOrder: collection.displayOrder,
            price: collection.price,
            viewCount: 0, // 重置访问次数
          }).returning();

          // 克隆画集标签关联
          const sourceCollectionTags = await db.select()
            .from(comicUniverseCollectionTags)
            .where(eq(comicUniverseCollectionTags.collectionId, collection.id));

          for (const collectionTag of sourceCollectionTags) {
            const newTagId = tagMapping[collectionTag.tagId];
            if (newTagId) {
              await db.insert(comicUniverseCollectionTags).values({
                collectionId: newCollection.id,
                tagId: newTagId,
              });
            }
          }

          // 克隆作品（如果选择克隆作品）
          if (body.cloneArtworks === true) {
            const sourceArtworks = await db.select()
              .from(comicUniverseArtworks)
              .where(eq(comicUniverseArtworks.collectionId, collection.id));

            for (const artwork of sourceArtworks) {
              await db.insert(comicUniverseArtworks).values({
                collectionId: newCollection.id,
                title: artwork.title,
                number: artwork.number,
                image: artwork.image,
                fileId: artwork.fileId,
                migrationStatus: artwork.migrationStatus,
                description: artwork.description,
                createdTime: artwork.createdTime,
                theme: artwork.theme,
                dimensions: artwork.dimensions,
                pageOrder: artwork.pageOrder,
                isActive: artwork.isActive,
              });
            }

            console.log(`✅ [活动API] 为画集 ${newCollection.id} 克隆了 ${sourceArtworks.length} 个作品`);
          }
        }

        console.log(`✅ [活动API] 克隆了 ${sourceCollections.length} 个画集`);
      }
    }

    console.log('🎉 [活动API] 活动克隆完成:', newEvent.id);

    return NextResponse.json({
      success: true,
      data: newEvent,
      message: '活动克隆成功',
      cloneDetails: {
        sourceEventId,
        newEventId: newEvent.id,
        clonedConfig: body.cloneConfig !== false,
        clonedData: body.cloneData === true,
        clonedCollections: body.cloneCollections === true,
        clonedArtworks: body.cloneArtworks === true
      }
    });

  } catch (error) {
    console.error('❌ [活动API] 克隆活动失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '克隆活动失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
