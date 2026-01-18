/**
 * ShowMasterpiece 活动感知的画集服务
 * 
 * 扩展原有的画集服务，添加多活动支持。
 * 这个服务作为原有服务的包装器，在保持API兼容性的同时添加活动隔离功能。
 */

import { db } from '@/db';
import { 
  comicUniverseCollections,
  comicUniverseCategories,
  comicUniverseTags,
  comicUniverseCollectionTags,
  comicUniverseArtworks
} from '@/db/schema';
import { eq, desc, asc, and, sql, inArray } from 'drizzle-orm';
import { EventService, EventResolution } from './eventService';
import { collectionsDbService } from '../db/masterpiecesDbService';
import type { 
  ArtCollection, 
  ArtworkPage,
  CollectionFormData,
  ArtworkFormData,
} from '../types';

/**
 * 活动感知的画集服务
 */
export class EventAwareCollectionsService {
  /**
   * 获取指定活动的所有画集（支持缓存）
   */
  static async getAllCollections(useCache: boolean = true, eventParam?: string): Promise<ArtCollection[]> {
    try {
      // 解析活动参数
      const { eventId, event } = await EventService.resolveEvent(eventParam);
      
      console.log('📚 [EventAwareCollections] 获取画集列表:', { 
        eventId, 
        eventName: event.name, 
        useCache 
      });

      // 获取画集基本信息
      const collections = await db.select()
        .from(comicUniverseCollections)
        .where(and(
          eq(comicUniverseCollections.isPublished, true)
        ))
        .orderBy(desc(comicUniverseCollections.displayOrder), desc(comicUniverseCollections.createdAt));

      // 并行获取关联数据
      const collectionsWithData = await Promise.all(
        collections.map(async (collection) => {
          const [category, artworks, tags] = await Promise.all([
            // 获取分类信息
            collection.categoryId 
              ? db.select()
                  .from(comicUniverseCategories)
                  .where(and(
                    eq(comicUniverseCategories.id, collection.categoryId),
                  ))
                  .limit(1)
              : Promise.resolve([]),
            
            // 获取作品列表
            db.select()
              .from(comicUniverseArtworks)
              .where(and(
                eq(comicUniverseArtworks.collectionId, collection.id),
                eq(comicUniverseArtworks.isActive, true)
              ))
              .orderBy(asc(comicUniverseArtworks.pageOrder)),
            
            // 获取标签列表
            db.select({
              id: comicUniverseTags.id,
              name: comicUniverseTags.name,
              color: comicUniverseTags.color,
            })
              .from(comicUniverseCollectionTags)
              .innerJoin(
                comicUniverseTags,
                and(
                  eq(comicUniverseCollectionTags.tagId, comicUniverseTags.id),
                  eq(comicUniverseTags.eventId, eventId)
                )
              )
              .where(eq(comicUniverseCollectionTags.collectionId, collection.id))
          ]);

          console.log('🎨 [getAllCollections] 获取画集作品列表:', artworks);
          // 转换数据格式
          const mappedArtworks: ArtworkPage[] = artworks.map(artwork => ({
            id: artwork.id,
            title: artwork.title,
            number: artwork.number,
            image: artwork.image || '',
            fileId: artwork.fileId || undefined,
            description: artwork.description || '',
            createdTime: artwork.createdTime || '',
            theme: artwork.theme || '',
            dimensions: artwork.dimensions || '',
            pageOrder: artwork.pageOrder
          }));

          const result: ArtCollection = {
            id: collection.id,
            title: collection.title,
            number: collection.number,
            coverImage: collection.coverImage,
            coverImageFileId: collection.coverImageFileId || undefined,
            description: collection.description || '',
            category: (category[0]?.name as any) || 'collection',
            tags: tags.map(tag => tag.name),
            pages: mappedArtworks,
            isPublished: collection.isPublished,
            price: collection.price || undefined
          };

          return result;
        })
      );

      console.log(`✅ [EventAwareCollections] 获取了 ${collectionsWithData.length} 个画集,collectionsWithData:`, collectionsWithData);
      return collectionsWithData;

    } catch (error) {
      console.error('❌ [EventAwareCollections] 获取画集列表失败:', error);
      
      // 如果是活动不存在的错误，返回空列表
      if (error instanceof Error && error.message.includes('不存在')) {
        console.warn('⚠️ [EventAwareCollections] 活动不存在，返回空列表');
        return [];
      }
      
      throw error;
    }
  }

  /**
   * 获取指定活动的画集概览（不包含作品详情）
   */
  static async getCollectionsOverview(eventParam?: string) {
    try {
      // 解析活动参数
      const { eventId, event } = await EventService.resolveEvent(eventParam);
      
      console.log('📋 [EventAwareCollections] 获取画集概览:', { 
        eventId, 
        eventName: event.name 
      });

      // 获取画集基本信息（不包含作品）
      const collections = await db.select()
        .from(comicUniverseCollections)
        .where(and(
          eq(comicUniverseCollections.eventId, eventId),
          eq(comicUniverseCollections.isPublished, true)
        ))
        .orderBy(desc(comicUniverseCollections.displayOrder), desc(comicUniverseCollections.createdAt));

      // 并行获取分类和标签信息
      const collectionsWithBasicData = await Promise.all(
        collections.map(async (collection) => {
          const [category, tags, artworkCount] = await Promise.all([
            // 获取分类信息
            collection.categoryId 
              ? db.select()
                  .from(comicUniverseCategories)
                  .where(and(
                    eq(comicUniverseCategories.id, collection.categoryId),
                    eq(comicUniverseCategories.eventId, eventId)
                  ))
                  .limit(1)
              : Promise.resolve([]),
            
            // 获取标签列表
            db.select({
              id: comicUniverseTags.id,
              name: comicUniverseTags.name,
              color: comicUniverseTags.color,
            })
              .from(comicUniverseCollectionTags)
              .innerJoin(
                comicUniverseTags,
                and(
                  eq(comicUniverseCollectionTags.tagId, comicUniverseTags.id),
                  eq(comicUniverseTags.eventId, eventId)
                )
              )
              .where(eq(comicUniverseCollectionTags.collectionId, collection.id)),
            
            // 获取作品数量
            db.select({ count: sql<number>`count(*)` })
              .from(comicUniverseArtworks)
              .where(and(
                eq(comicUniverseArtworks.collectionId, collection.id),
                eq(comicUniverseArtworks.isActive, true)
              ))
          ]);

          const result: ArtCollection = {
            id: collection.id,
            title: collection.title,
            number: collection.number,
            coverImage: collection.coverImage,
            coverImageFileId: collection.coverImageFileId || undefined,
            description: collection.description || '',
            category: (category[0]?.name as any) || '画集',
            tags: tags.map(tag => tag.name),
            pages: [], // 概览模式不包含作品详情
            isPublished: collection.isPublished,
            price: collection.price || undefined
          };

          return result;
        })
      );

      console.log(`✅ [EventAwareCollections] 获取了 ${collectionsWithBasicData.length} 个画集概览`);
      return collectionsWithBasicData;

    } catch (error) {
      console.error('❌ [EventAwareCollections] 获取画集概览失败:', error);
      
      // 如果是活动不存在的错误，返回空列表
      if (error instanceof Error && error.message.includes('不存在')) {
        console.warn('⚠️ [EventAwareCollections] 活动不存在，返回空列表');
        return [];
      }
      
      throw error;
    }
  }

  /**
   * 创建画集（指定活动）
   */
  static async createCollection(collectionData: CollectionFormData, eventParam?: string): Promise<ArtCollection> {
    try {
      // 解析活动参数
      const { eventId, event } = await EventService.resolveEvent(eventParam);
      
      console.log('📝 [EventAwareCollections] 创建画集:', { 
        eventId, 
        eventName: event.name,
        title: collectionData.title 
      });

      // 确保创建的画集关联到正确的活动
      const enhancedData = {
        ...collectionData,
        eventId // 添加活动ID
      };

      // 调用原有的创建逻辑，但需要适配新的数据结构
      return await this.createCollectionWithEventId(enhancedData);

    } catch (error) {
      console.error('❌ [EventAwareCollections] 创建画集失败:', error);
      throw error;
    }
  }

  /**
   * 创建带活动ID的画集（内部方法）
   */
  private static async createCollectionWithEventId(collectionData: CollectionFormData & { eventId: number }): Promise<ArtCollection> {
    // 这里需要重新实现创建逻辑，确保包含eventId
    // 为了简化，现在直接调用原有服务的方法
    // 在实际实现中，应该重写这个方法以支持eventId
    
    // TODO: 重新实现createCollection方法以支持eventId
    throw new Error('创建画集方法需要重新实现以支持活动ID');
  }

  /**
   * 获取指定活动的分类列表
   */
  static async getCategories(eventParam?: string) {
    try {
      const { eventId } = await EventService.resolveEvent(eventParam);
      
      return db.select()
        .from(comicUniverseCategories)
        .where(and(
          eq(comicUniverseCategories.eventId, eventId),
          eq(comicUniverseCategories.isActive, true)
        ))
        .orderBy(asc(comicUniverseCategories.displayOrder));

    } catch (error) {
      console.error('❌ [EventAwareCollections] 获取分类失败:', error);
      return [];
    }
  }

  /**
   * 获取指定活动的标签列表
   */
  static async getTags(eventParam?: string) {
    try {
      const { eventId } = await EventService.resolveEvent(eventParam);
      
      return db.select()
        .from(comicUniverseTags)
        .where(and(
          eq(comicUniverseTags.eventId, eventId),
          eq(comicUniverseTags.isActive, true)
        ));

    } catch (error) {
      console.error('❌ [EventAwareCollections] 获取标签失败:', error);
      return [];
    }
  }
}

// 导出服务实例
export const eventAwareCollectionsService = EventAwareCollectionsService;
