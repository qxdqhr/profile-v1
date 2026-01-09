/**
 * ShowMasterpiece 活动管理 API
 * 
 * 提供活动的增删改查功能，支持多期活动管理。
 * 
 * 路由: /api/showmasterpiece/events
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

    // 处理数据复制逻辑
    const {
      cloneData = false,
      cloneFromEventId,
      cloneCollections = false,
      cloneArtworks = false
    } = body;

    if (cloneData && cloneFromEventId && (cloneCollections || cloneArtworks)) {
      console.log('🔄 [活动API] 开始复制数据:', {
        fromEventId: cloneFromEventId,
        toEventId: newEvent.id,
        cloneCollections,
        cloneArtworks
      });

      try {
        // 获取源活动的分类和标签（如果需要复制画集）
        if (cloneCollections) {
          // 复制分类
          const sourceCategories = await db.select()
            .from(comicUniverseCategories)
            .where(eq(comicUniverseCategories.eventId, cloneFromEventId));

          if (sourceCategories.length > 0) {
            console.log(`📋 [活动API] 复制 ${sourceCategories.length} 个分类`);

            const categoryMappings = new Map<number, number>();

            // 创建新的分类
            for (const category of sourceCategories) {
              const [newCategory] = await db.insert(comicUniverseCategories).values({
                eventId: newEvent.id,
                name: category.name,
                description: category.description,
                displayOrder: category.displayOrder,
                isActive: category.isActive,
              }).returning();

              categoryMappings.set(category.id, newCategory.id);
            }

            // 复制标签
            const sourceTags = await db.select()
              .from(comicUniverseTags)
              .where(eq(comicUniverseTags.eventId, cloneFromEventId));

            if (sourceTags.length > 0) {
              console.log(`🏷️ [活动API] 复制 ${sourceTags.length} 个标签`);

              const tagMappings = new Map<number, number>();

              // 创建新的标签
              for (const tag of sourceTags) {
                const [newTag] = await db.insert(comicUniverseTags).values({
                  eventId: newEvent.id,
                  name: tag.name,
                  color: tag.color,
                  isActive: tag.isActive,
                }).returning();

                tagMappings.set(tag.id, newTag.id);
              }

              // 复制画集
              const sourceCollections = await db.select()
                .from(comicUniverseCollections)
                .where(eq(comicUniverseCollections.eventId, cloneFromEventId));

              if (sourceCollections.length > 0) {
                console.log(`🎨 [活动API] 复制 ${sourceCollections.length} 个画集`);

                const collectionMappings = new Map<number, number>();

                // 创建新的画集
                for (const collection of sourceCollections) {
                  const [newCollection] = await db.insert(comicUniverseCollections).values({
                    eventId: newEvent.id,
                    title: collection.title,
                    number: collection.number,
                    coverImage: collection.coverImage,
                    coverImageFileId: collection.coverImageFileId,
                    description: collection.description,
                    categoryId: collection.categoryId ? categoryMappings.get(collection.categoryId) || null : null,
                    isPublished: collection.isPublished,
                    publishedAt: collection.publishedAt,
                    displayOrder: collection.displayOrder,
                    price: collection.price,
                    viewCount: 0, // 重置访问计数
                  }).returning();

                  collectionMappings.set(collection.id, newCollection.id);
                }

                // 复制画集标签关联
                if (tagMappings.size > 0 && collectionMappings.size > 0) {
                  // 获取源活动的所有画集标签关联
                  const allSourceCollectionTags: any[] = [];
                  for (const collection of sourceCollections) {
                    const tags = await db.select()
                      .from(comicUniverseCollectionTags)
                      .where(eq(comicUniverseCollectionTags.collectionId, collection.id));

                    for (const tagRelation of tags) {
                      allSourceCollectionTags.push({
                        sourceCollectionId: collection.id,
                        tagId: tagRelation.tagId
                      });
                    }
                  }

                  if (allSourceCollectionTags.length > 0) {
                    console.log(`🔗 [活动API] 复制 ${allSourceCollectionTags.length} 个画集标签关联`);

                    // 创建新的画集标签关联
                    const newCollectionTags = allSourceCollectionTags.map(relation => {
                      const newCollectionId = collectionMappings.get(relation.sourceCollectionId);
                      const newTagId = tagMappings.get(relation.tagId);

                      if (newCollectionId && newTagId) {
                        return {
                          collectionId: newCollectionId,
                          tagId: newTagId
                        };
                      }
                      return null;
                    }).filter(Boolean);

                    if (newCollectionTags.length > 0) {
                      await db.insert(comicUniverseCollectionTags).values(newCollectionTags);
                    }
                  }
                }

                // 如果需要复制作品数据
                if (cloneArtworks && collectionMappings.size > 0) {
                  console.log('🎭 [活动API] 开始复制作品数据');

                  let totalArtworks = 0;

                  // 为每个画集复制作品
                  for (const [sourceCollectionId, newCollectionId] of collectionMappings) {
                    const sourceArtworks = await db.select()
                      .from(comicUniverseArtworks)
                      .where(eq(comicUniverseArtworks.collectionId, sourceCollectionId))
                      .orderBy(comicUniverseArtworks.pageOrder);

                    if (sourceArtworks.length > 0) {
                      console.log(`📄 [活动API] 复制画集 ${sourceCollectionId} 的 ${sourceArtworks.length} 个作品`);

                      const newArtworks = sourceArtworks.map(artwork => ({
                        collectionId: newCollectionId,
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
                      }));

                      await db.insert(comicUniverseArtworks).values(newArtworks);
                      totalArtworks += sourceArtworks.length;
                    }
                  }

                  console.log(`✅ [活动API] 作品数据复制完成，共复制 ${totalArtworks} 个作品`);
                }

                console.log('✅ [活动API] 画集数据复制完成');
              }
            }
          }
        }

        console.log('✅ [活动API] 数据复制完成');

      } catch (cloneError) {
        console.error('❌ [活动API] 数据复制失败:', cloneError);
        // 数据复制失败不应该影响活动创建成功，但要记录错误
        // 可以考虑在这里发送通知或记录到日志系统
      }
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
