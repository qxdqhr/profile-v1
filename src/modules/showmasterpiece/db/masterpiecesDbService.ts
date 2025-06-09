import { db } from '@/db/index';
import { 
  comicUniverseConfigs,
  comicUniverseCategories,
  comicUniverseTags,
  comicUniverseCollections,
  comicUniverseCollectionTags,
  comicUniverseArtworks
} from './schema/masterpieces';
import { eq, desc, asc, and, sql, inArray } from 'drizzle-orm';
import type { 
  MasterpiecesConfig, 
  ArtCollection, 
  ArtworkPage,
  CollectionFormData,
  ArtworkFormData 
} from '../types';

// 配置相关服务
export class MasterpiecesConfigDbService {
  // 获取配置
  async getConfig(): Promise<MasterpiecesConfig> {
    const configs = await db.select().from(comicUniverseConfigs).limit(1);
    
    if (configs.length === 0) {
      // 如果没有配置，创建默认配置
      const defaultConfig = await this.createDefaultConfig();
      return this.mapDbConfigToType(defaultConfig);
    }
    
    return this.mapDbConfigToType(configs[0]);
  }

  // 更新配置
  async updateConfig(configData: Partial<MasterpiecesConfig>): Promise<MasterpiecesConfig> {
    const configs = await db.select().from(comicUniverseConfigs).limit(1);
    
    if (configs.length === 0) {
      // 如果没有配置，创建新配置
      const newConfig = await db.insert(comicUniverseConfigs).values({
        siteName: configData.siteName || '画集展览',
        siteDescription: configData.siteDescription || '精美的艺术作品展览',
        heroTitle: configData.heroTitle || '艺术画集展览',
        heroSubtitle: configData.heroSubtitle || '探索精美的艺术作品，感受创作的魅力',
        maxCollectionsPerPage: configData.maxCollectionsPerPage || 9,
        enableSearch: configData.enableSearch ?? true,
        enableCategories: configData.enableCategories ?? true,
        defaultCategory: configData.defaultCategory || 'all',
        theme: configData.theme || 'light',
        language: configData.language || 'zh',
        updatedAt: new Date(),
      }).returning();
      
      return this.mapDbConfigToType(newConfig[0]);
    } else {
      // 更新现有配置
      const updateData: any = {
        updatedAt: new Date(),
      };
      
      // 只更新提供的字段
      if (configData.siteName !== undefined) updateData.siteName = configData.siteName;
      if (configData.siteDescription !== undefined) updateData.siteDescription = configData.siteDescription;
      if (configData.heroTitle !== undefined) updateData.heroTitle = configData.heroTitle;
      if (configData.heroSubtitle !== undefined) updateData.heroSubtitle = configData.heroSubtitle;
      if (configData.maxCollectionsPerPage !== undefined) updateData.maxCollectionsPerPage = configData.maxCollectionsPerPage;
      if (configData.enableSearch !== undefined) updateData.enableSearch = configData.enableSearch;
      if (configData.enableCategories !== undefined) updateData.enableCategories = configData.enableCategories;
      if (configData.defaultCategory !== undefined) updateData.defaultCategory = configData.defaultCategory;
      if (configData.theme !== undefined) updateData.theme = configData.theme;
      if (configData.language !== undefined) updateData.language = configData.language;

      const updatedConfig = await db.update(comicUniverseConfigs)
        .set(updateData)
        .where(eq(comicUniverseConfigs.id, configs[0].id))
        .returning();
      
      return this.mapDbConfigToType(updatedConfig[0]);
    }
  }

  // 重置为默认配置
  async resetConfig(): Promise<MasterpiecesConfig> {
    await db.delete(comicUniverseConfigs);
    const defaultConfig = await this.createDefaultConfig();
    return this.mapDbConfigToType(defaultConfig);
  }

  // 创建默认配置
  private async createDefaultConfig() {
    const newConfig = await db.insert(comicUniverseConfigs).values({
      siteName: '画集展览',
      siteDescription: '精美的艺术作品展览',
      heroTitle: '艺术画集展览',
      heroSubtitle: '探索精美的艺术作品，感受创作的魅力',
      maxCollectionsPerPage: 9,
      enableSearch: true,
      enableCategories: true,
      defaultCategory: 'all',
      theme: 'light',
      language: 'zh',
    }).returning();
    
    return newConfig[0];
  }

  // 映射数据库配置到类型
  private mapDbConfigToType(dbConfig: any): MasterpiecesConfig {
    return {
      siteName: dbConfig.siteName,
      siteDescription: dbConfig.siteDescription,
      heroTitle: dbConfig.heroTitle,
      heroSubtitle: dbConfig.heroSubtitle,
      maxCollectionsPerPage: dbConfig.maxCollectionsPerPage,
      enableSearch: dbConfig.enableSearch,
      enableCategories: dbConfig.enableCategories,
      defaultCategory: dbConfig.defaultCategory,
      theme: dbConfig.theme,
      language: dbConfig.language,
    };
  }
}

// 分类相关服务
export class CategoriesDbService {
  // 获取所有分类
  async getCategories(): Promise<string[]> {
    const categories = await db.select()
      .from(comicUniverseCategories)
      .where(eq(comicUniverseCategories.isActive, true))
      .orderBy(asc(comicUniverseCategories.displayOrder), asc(comicUniverseCategories.name));
    
    return categories.map(cat => cat.name);
  }

  // 创建分类
  async createCategory(name: string, description?: string): Promise<void> {
    await db.insert(comicUniverseCategories).values({
      name,
      description,
    });
  }
}

// 标签相关服务
export class TagsDbService {
  // 获取所有标签
  async getTags(): Promise<string[]> {
    const tags = await db.select()
      .from(comicUniverseTags)
      .where(eq(comicUniverseTags.isActive, true))
      .orderBy(asc(comicUniverseTags.name));
    
    return tags.map(tag => tag.name);
  }

  // 创建标签
  async createTag(name: string, color?: string): Promise<void> {
    await db.insert(comicUniverseTags).values({
      name,
      color: color || '#3b82f6',
    });
  }
}

// 画集相关服务
export class CollectionsDbService {
  // 缓存配置 - 多层缓存策略
  private collectionsCache: ArtCollection[] | null = null;
  private collectionsCacheTime: number = 0;
  private collectionsOverviewCache: Omit<ArtCollection, 'pages'>[] | null = null;
  private collectionsOverviewCacheTime: number = 0;
  
  // 优化缓存时间配置
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 延长到10分钟
  private readonly OVERVIEW_CACHE_DURATION = 15 * 60 * 1000; // 概览缓存15分钟
  private readonly STALE_WHILE_REVALIDATE = 30 * 60 * 1000; // 过期后30分钟内可用

  /**
   * 获取所有画集 - 优化版本
   * 
   * 性能问题分析:
   * 1. 复杂的多表关联查询 - 涉及5个表的数据整合
   * 2. 作品数据量大 - 包含所有作品的完整信息（特别是图片数据）
   * 3. N+1查询风险 - 虽然使用并行查询，但仍有优化空间
   * 4. 缓存策略有限 - 2分钟缓存时间较短，首次访问必须全量查询
   * 
   * 优化策略:
   * ✅ 并行查询 - 分类、标签、作品数据并行获取
   * ✅ 内存缓存 - 减少重复查询
   * ✅ 字段选择 - 只查询必要字段
   * ✅ 延长缓存时间 - 从2分钟增加到10分钟
   * ⚠️ 需要优化 - 数据库索引、分页加载、图片懒加载
   */
  async getAllCollections(useCache: boolean = true): Promise<ArtCollection[]> {
    // 检查缓存 - 首次访问时缓存为空，必须执行完整查询
    if (useCache && this.collectionsCache) {
      const cacheAge = Date.now() - this.collectionsCacheTime;
      
      // 如果在有效期内，直接返回缓存
      if (cacheAge < this.CACHE_DURATION) {
        return this.collectionsCache;
      }
      
      // 如果在stale-while-revalidate期内，返回缓存但异步更新
      if (cacheAge < this.STALE_WHILE_REVALIDATE) {
        // 异步更新缓存，不阻塞当前请求
        this.refreshCacheInBackground();
        return this.collectionsCache;
      }
    }

    try {
      // 执行完整查询
      const result = await this.fetchAllCollectionsFromDb();
      
      // 更新缓存
      this.collectionsCache = result;
      this.collectionsCacheTime = Date.now();

      return result;

    } catch (error) {
      console.error('获取画集数据失败:', error);
      
      // 如果查询失败但有过期缓存，返回过期缓存
      if (this.collectionsCache) {
        console.warn('数据库查询失败，返回过期缓存数据');
        return this.collectionsCache;
      }
      
      throw error;
    }
  }

  /**
   * 获取画集概览 - 不包含作品详情的轻量版本
   * 适用于首页列表、搜索结果等场景
   */
  async getCollectionsOverview(): Promise<Omit<ArtCollection, 'pages'>[]> {
    // 检查概览缓存
    if (this.collectionsOverviewCache) {
      const cacheAge = Date.now() - this.collectionsOverviewCacheTime;
      
      if (cacheAge < this.OVERVIEW_CACHE_DURATION) {
        return this.collectionsOverviewCache;
      }
      
      // stale-while-revalidate策略
      if (cacheAge < this.STALE_WHILE_REVALIDATE) {
        this.refreshOverviewCacheInBackground();
        return this.collectionsOverviewCache;
      }
    }

    try {
      const result = await this.fetchCollectionsOverviewFromDb();
      
      // 更新缓存
      this.collectionsOverviewCache = result;
      this.collectionsOverviewCacheTime = Date.now();

      return result;

    } catch (error) {
      console.error('获取画集概览失败:', error);
      
      // 降级策略：返回过期缓存
      if (this.collectionsOverviewCache) {
        console.warn('数据库查询失败，返回过期缓存数据');
        return this.collectionsOverviewCache;
      }
      
      throw error;
    }
  }

  /**
   * 后台异步刷新完整缓存
   */
  private async refreshCacheInBackground(): Promise<void> {
    try {
      const result = await this.fetchAllCollectionsFromDb();
      this.collectionsCache = result;
      this.collectionsCacheTime = Date.now();
      console.log('缓存已在后台更新');
    } catch (error) {
      console.error('后台缓存更新失败:', error);
    }
  }

  /**
   * 后台异步刷新概览缓存
   */
  private async refreshOverviewCacheInBackground(): Promise<void> {
    try {
      const result = await this.fetchCollectionsOverviewFromDb();
      this.collectionsOverviewCache = result;
      this.collectionsOverviewCacheTime = Date.now();
      console.log('概览缓存已在后台更新');
    } catch (error) {
      console.error('后台概览缓存更新失败:', error);
    }
  }

  /**
   * 从数据库获取完整画集数据
   */
  private async fetchAllCollectionsFromDb(): Promise<ArtCollection[]> {
    // 1. 首先获取画集基本信息（不包含作品）
    // 潜在问题：如果画集数量很多，这个查询本身也会变慢
    const collections = await db
      .select({
        id: comicUniverseCollections.id,
        title: comicUniverseCollections.title,
        artist: comicUniverseCollections.artist,
        coverImage: comicUniverseCollections.coverImage, // 可能是大的base64图片数据
        description: comicUniverseCollections.description,
        isPublished: comicUniverseCollections.isPublished,
        displayOrder: comicUniverseCollections.displayOrder, // 需要索引优化
        createdAt: comicUniverseCollections.createdAt,
        categoryId: comicUniverseCollections.categoryId,
      })
      .from(comicUniverseCollections)
      .where(eq(comicUniverseCollections.isPublished, true)) // 需要isPublished字段索引
      .orderBy(
        desc(comicUniverseCollections.displayOrder), // 需要displayOrder字段索引
        desc(comicUniverseCollections.createdAt)
      );

    if (collections.length === 0) {
      return [];
    }

    const collectionIds = collections.map(c => c.id);

    // 2. 并行获取分类、标签和作品数据
    // 优化点：虽然是并行查询，但作品数据查询可能非常耗时
    const [categories, tags, artworks] = await Promise.all([
      // 获取分类信息 - 相对轻量
      db
        .select({
          id: comicUniverseCategories.id,
          name: comicUniverseCategories.name,
        })
        .from(comicUniverseCategories)
        .where(eq(comicUniverseCategories.isActive, true)), // 需要isActive字段索引

      // 获取标签信息 - 相对轻量，但涉及JOIN
      db
        .select({
          collectionId: comicUniverseCollectionTags.collectionId,
          tagName: comicUniverseTags.name,
        })
        .from(comicUniverseCollectionTags)
        .innerJoin(
          comicUniverseTags,
          eq(comicUniverseCollectionTags.tagId, comicUniverseTags.id)
        )
        .where(
          and(
            inArray(comicUniverseCollectionTags.collectionId, collectionIds), // 需要复合索引
            eq(comicUniverseTags.isActive, true)
          )
        ),

      // 获取作品信息 - 这是最耗时的查询，特别是image字段可能很大
      db
        .select({
          collectionId: comicUniverseArtworks.collectionId,
          id: comicUniverseArtworks.id,
          title: comicUniverseArtworks.title,
          artist: comicUniverseArtworks.artist,
          image: comicUniverseArtworks.image, // ⚠️ 性能瓶颈：可能是大的base64图片
          description: comicUniverseArtworks.description,
          createdTime: comicUniverseArtworks.createdTime,
          theme: comicUniverseArtworks.theme,
          pageOrder: comicUniverseArtworks.pageOrder, // 需要索引优化
        })
        .from(comicUniverseArtworks)
        .where(
          and(
            inArray(comicUniverseArtworks.collectionId, collectionIds), // 需要复合索引
            eq(comicUniverseArtworks.isActive, true) // 需要isActive字段索引
          )
        )
        .orderBy(asc(comicUniverseArtworks.pageOrder)) // 需要pageOrder字段索引
    ]);

    // 3. 构建映射表以提高查找效率
    // 优化：使用Map而不是数组查找，时间复杂度从O(n)降到O(1)
    const categoriesMap = new Map(categories.map(cat => [cat.id, cat.name]));
    
    const tagsMap = new Map<number, string[]>();
    tags.forEach(tag => {
      if (!tagsMap.has(tag.collectionId)) {
        tagsMap.set(tag.collectionId, []);
      }
      tagsMap.get(tag.collectionId)!.push(tag.tagName);
    });

    const artworksMap = new Map<number, ArtworkPage[]>();
    artworks.forEach(artwork => {
      if (!artworksMap.has(artwork.collectionId)) {
        artworksMap.set(artwork.collectionId, []);
      }
      artworksMap.get(artwork.collectionId)!.push({
        id: artwork.id,
        title: artwork.title || '',
        artist: artwork.artist || '',
        image: artwork.image || '', // 包含完整图片数据，可能很大
        description: artwork.description || '',
        createdTime: artwork.createdTime || '',
        theme: artwork.theme || '',
      });
    });

    // 4. 构建最终结果
    return collections.map(collection => ({
      id: collection.id,
      title: collection.title,
      artist: collection.artist,
      coverImage: collection.coverImage, // 可能是大图片
      description: collection.description || '',
      category: collection.categoryId ? (categoriesMap.get(collection.categoryId) || '') : '',
      tags: tagsMap.get(collection.id) || [],
      isPublished: collection.isPublished,
      pages: artworksMap.get(collection.id) || [], // 包含所有作品的完整数据
    }));
  }

  /**
   * 从数据库获取画集概览数据
   */
  private async fetchCollectionsOverviewFromDb(): Promise<Omit<ArtCollection, 'pages'>[]> {
    try {
      // 1. 获取画集基本信息
      const collections = await db
        .select({
          id: comicUniverseCollections.id,
          title: comicUniverseCollections.title,
          artist: comicUniverseCollections.artist,
          coverImage: comicUniverseCollections.coverImage,
          description: comicUniverseCollections.description,
          isPublished: comicUniverseCollections.isPublished,
          displayOrder: comicUniverseCollections.displayOrder,
          createdAt: comicUniverseCollections.createdAt,
          categoryId: comicUniverseCollections.categoryId,
        })
        .from(comicUniverseCollections)
        .where(eq(comicUniverseCollections.isPublished, true))
        .orderBy(
          desc(comicUniverseCollections.displayOrder),
          desc(comicUniverseCollections.createdAt)
        );

      if (collections.length === 0) {
        return [];
      }

      const collectionIds = collections.map(c => c.id);

      // 2. 并行获取分类、标签和作品数量
      const [categories, tags, artworkCounts] = await Promise.all([
        // 获取分类信息
        db
          .select({
            id: comicUniverseCategories.id,
            name: comicUniverseCategories.name,
          })
          .from(comicUniverseCategories)
          .where(eq(comicUniverseCategories.isActive, true)),

        // 获取标签信息
        db
          .select({
            collectionId: comicUniverseCollectionTags.collectionId,
            tagName: comicUniverseTags.name,
          })
          .from(comicUniverseCollectionTags)
          .innerJoin(
            comicUniverseTags,
            eq(comicUniverseCollectionTags.tagId, comicUniverseTags.id)
          )
          .where(
            and(
              inArray(comicUniverseCollectionTags.collectionId, collectionIds),
              eq(comicUniverseTags.isActive, true)
            )
          ),

        // 获取作品数量（而不是具体作品）
        db
          .select({
            collectionId: comicUniverseArtworks.collectionId,
            count: sql<number>`count(*)`.as('count'),
          })
          .from(comicUniverseArtworks)
          .where(
            and(
              inArray(comicUniverseArtworks.collectionId, collectionIds),
              eq(comicUniverseArtworks.isActive, true)
            )
          )
          .groupBy(comicUniverseArtworks.collectionId)
      ]);

      // 3. 构建映射表
      const categoriesMap = new Map(categories.map(cat => [cat.id, cat.name]));
      
      const tagsMap = new Map<number, string[]>();
      tags.forEach(tag => {
        if (!tagsMap.has(tag.collectionId)) {
          tagsMap.set(tag.collectionId, []);
        }
        tagsMap.get(tag.collectionId)!.push(tag.tagName);
      });

      const artworkCountsMap = new Map(artworkCounts.map(ac => [ac.collectionId, ac.count]));

      // 4. 构建结果（包含作品数量而不是具体作品）
      return collections.map(collection => ({
        id: collection.id,
        title: collection.title,
        artist: collection.artist,
        coverImage: collection.coverImage,
        description: collection.description || '',
        category: collection.categoryId ? (categoriesMap.get(collection.categoryId) || '') : '',
        tags: tagsMap.get(collection.id) || [],
        isPublished: collection.isPublished,
        artworkCount: artworkCountsMap.get(collection.id) || 0,
      }));

    } catch (error) {
      console.error('获取画集概览失败:', error);
      throw error;
    }
  }

  // 清除缓存的方法
  clearCache(): void {
    this.collectionsCache = null;
    this.collectionsCacheTime = 0;
    this.collectionsOverviewCache = null;
    this.collectionsOverviewCacheTime = 0;
  }

  // 创建画集
  async createCollection(collectionData: CollectionFormData): Promise<ArtCollection> {
    // 获取或创建分类
    let categoryId: number | null = null;
    if (collectionData.category) {
      const existingCategory = await db.select()
        .from(comicUniverseCategories)
        .where(eq(comicUniverseCategories.name, collectionData.category))
        .limit(1);
      
      if (existingCategory.length > 0) {
        categoryId = existingCategory[0].id;
      } else {
        const newCategory = await db.insert(comicUniverseCategories).values({
          name: collectionData.category,
        }).returning();
        categoryId = newCategory[0].id;
      }
    }

    // 创建画集
    const newCollection = await db.insert(comicUniverseCollections).values({
      title: collectionData.title,
      artist: collectionData.artist,
      coverImage: collectionData.coverImage,
      description: collectionData.description,
      categoryId,
      isPublished: collectionData.isPublished,
      publishedAt: collectionData.isPublished ? new Date() : null,
    }).returning();

    // 处理标签
    if (collectionData.tags && collectionData.tags.length > 0) {
      await this.updateCollectionTags(newCollection[0].id, collectionData.tags);
    }

    // 清除缓存
    this.clearCache();

    // 返回完整的画集数据
    const collections = await this.getAllCollections(false); // 强制重新查询
    return collections.find(c => c.id === newCollection[0].id)!;
  }

  // 更新画集
  async updateCollection(id: number, collectionData: CollectionFormData): Promise<ArtCollection> {
    // 获取或创建分类
    let categoryId: number | null = null;
    if (collectionData.category) {
      const existingCategory = await db.select()
        .from(comicUniverseCategories)
        .where(eq(comicUniverseCategories.name, collectionData.category))
        .limit(1);
      
      if (existingCategory.length > 0) {
        categoryId = existingCategory[0].id;
      } else {
        const newCategory = await db.insert(comicUniverseCategories).values({
          name: collectionData.category,
        }).returning();
        categoryId = newCategory[0].id;
      }
    }

    // 更新画集
    await db.update(comicUniverseCollections)
      .set({
        title: collectionData.title,
        artist: collectionData.artist,
        coverImage: collectionData.coverImage,
        description: collectionData.description,
        categoryId,
        isPublished: collectionData.isPublished,
        publishedAt: collectionData.isPublished ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(comicUniverseCollections.id, id));

    // 更新标签
    await this.updateCollectionTags(id, collectionData.tags || []);

    // 清除缓存
    this.clearCache();

    // 返回更新后的画集数据
    const collections = await this.getAllCollections(false); // 强制重新查询
    return collections.find(c => c.id === id)!;
  }

  // 删除画集
  async deleteCollection(id: number): Promise<void> {
    await db.delete(comicUniverseCollections)
      .where(eq(comicUniverseCollections.id, id));
    
    // 清除缓存
    this.clearCache();
  }

  // 更新画集标签
  private async updateCollectionTags(collectionId: number, tagNames: string[]): Promise<void> {
    // 删除现有标签关联
    await db.delete(comicUniverseCollectionTags)
      .where(eq(comicUniverseCollectionTags.collectionId, collectionId));

    if (tagNames.length === 0) return;

    // 获取或创建标签
    const tagIds: number[] = [];
    for (const tagName of tagNames) {
      const existingTag = await db.select()
        .from(comicUniverseTags)
        .where(eq(comicUniverseTags.name, tagName))
        .limit(1);
      
      if (existingTag.length > 0) {
        tagIds.push(existingTag[0].id);
      } else {
        const newTag = await db.insert(comicUniverseTags).values({
          name: tagName,
        }).returning();
        tagIds.push(newTag[0].id);
      }
    }

    // 创建新的标签关联
    const tagRelations = tagIds.map(tagId => ({
      collectionId,
      tagId,
    }));

    await db.insert(comicUniverseCollectionTags).values(tagRelations);
  }

  // 更新画集显示顺序
  async updateCollectionOrder(collectionOrders: { id: number; displayOrder: number }[]): Promise<void> {
    try {
      // 使用事务批量更新显示顺序
      await db.transaction(async (tx) => {
        for (const { id, displayOrder } of collectionOrders) {
          await tx
            .update(comicUniverseCollections)
            .set({ 
              displayOrder,
              updatedAt: new Date()
            })
            .where(eq(comicUniverseCollections.id, id));
        }
      });

      // 清除缓存
      this.clearCache();
    } catch (error) {
      console.error('更新画集顺序失败:', error);
      throw error;
    }
  }

  // 移动画集到指定位置
  async moveCollection(collectionId: number, targetOrder: number): Promise<void> {
    try {
      // 获取当前所有已发布的画集
      const collections = await db
        .select({
          id: comicUniverseCollections.id,
          displayOrder: comicUniverseCollections.displayOrder,
        })
        .from(comicUniverseCollections)
        .where(eq(comicUniverseCollections.isPublished, true))
        .orderBy(desc(comicUniverseCollections.displayOrder));

      // 找到要移动的画集
      const targetCollection = collections.find(c => c.id === collectionId);
      if (!targetCollection) {
        throw new Error('画集不存在');
      }

      // 重新计算所有画集的显示顺序
      const sortedCollections = collections.filter(c => c.id !== collectionId);
      sortedCollections.splice(targetOrder, 0, targetCollection);

      // 生成新的显示顺序，处理null值
      const updates = sortedCollections.map((collection, index) => ({
        id: collection.id,
        displayOrder: sortedCollections.length - index, // 从高到低排序
      }));

      await this.updateCollectionOrder(updates);
    } catch (error) {
      console.error('移动画集失败:', error);
      throw error;
    }
  }

  // 上移画集
  async moveCollectionUp(collectionId: number): Promise<void> {
    try {
      const collections = await db
        .select({
          id: comicUniverseCollections.id,
          displayOrder: comicUniverseCollections.displayOrder,
        })
        .from(comicUniverseCollections)
        .where(eq(comicUniverseCollections.isPublished, true))
        .orderBy(desc(comicUniverseCollections.displayOrder));

      const currentIndex = collections.findIndex(c => c.id === collectionId);
      if (currentIndex === -1) {
        throw new Error('画集不存在');
      }
      if (currentIndex === 0) {
        throw new Error('画集已经在最顶部');
      }

      // 交换当前画集和上一个画集的顺序，处理null值
      const targetIndex = currentIndex - 1;
      const currentOrder = collections[targetIndex].displayOrder ?? 0;
      const targetOrder = collections[currentIndex].displayOrder ?? 0;
      
      const updates = [
        { id: collections[currentIndex].id, displayOrder: currentOrder },
        { id: collections[targetIndex].id, displayOrder: targetOrder }
      ];

      await this.updateCollectionOrder(updates);
    } catch (error) {
      console.error('上移画集失败:', error);
      throw error;
    }
  }

  // 下移画集
  async moveCollectionDown(collectionId: number): Promise<void> {
    try {
      const collections = await db
        .select({
          id: comicUniverseCollections.id,
          displayOrder: comicUniverseCollections.displayOrder,
        })
        .from(comicUniverseCollections)
        .where(eq(comicUniverseCollections.isPublished, true))
        .orderBy(desc(comicUniverseCollections.displayOrder));

      const currentIndex = collections.findIndex(c => c.id === collectionId);
      if (currentIndex === -1) {
        throw new Error('画集不存在');
      }
      if (currentIndex === collections.length - 1) {
        throw new Error('画集已经在最底部');
      }

      // 交换当前画集和下一个画集的顺序，处理null值
      const targetIndex = currentIndex + 1;
      const currentOrder = collections[targetIndex].displayOrder ?? 0;
      const targetOrder = collections[currentIndex].displayOrder ?? 0;
      
      const updates = [
        { id: collections[currentIndex].id, displayOrder: currentOrder },
        { id: collections[targetIndex].id, displayOrder: targetOrder }
      ];

      await this.updateCollectionOrder(updates);
    } catch (error) {
      console.error('下移画集失败:', error);
      throw error;
    }
  }
}

// 作品相关服务
export class ArtworksDbService {
  constructor(private collectionsService: CollectionsDbService) {}

  // 添加作品到画集
  async addArtworkToCollection(collectionId: number, artworkData: ArtworkFormData): Promise<ArtworkPage> {
    // 获取当前画集中作品的最大顺序号
    const maxOrder = await db.select({
      maxOrder: sql<number>`COALESCE(MAX(${comicUniverseArtworks.pageOrder}), -1)`
    })
      .from(comicUniverseArtworks)
      .where(eq(comicUniverseArtworks.collectionId, collectionId));

    const newOrder = (maxOrder[0]?.maxOrder || -1) + 1;

    const newArtwork = await db.insert(comicUniverseArtworks).values({
      collectionId,
      title: artworkData.title,
      artist: artworkData.artist,
      image: artworkData.image,
      description: artworkData.description,
      createdTime: artworkData.createdTime,
      theme: artworkData.theme,
      pageOrder: newOrder,
    }).returning();

    // 清除画集缓存
    this.collectionsService.clearCache();

    return {
      id: newArtwork[0].id,
      title: newArtwork[0].title,
      artist: newArtwork[0].artist,
      image: newArtwork[0].image,
      description: newArtwork[0].description || undefined,
      createdTime: newArtwork[0].createdTime || undefined,
      theme: newArtwork[0].theme || undefined,
    };
  }

  // 更新作品
  async updateArtwork(collectionId: number, artworkId: number, artworkData: ArtworkFormData): Promise<ArtworkPage> {
    // 首先检查作品是否存在
    const existingArtwork = await db.select()
      .from(comicUniverseArtworks)
      .where(and(
        eq(comicUniverseArtworks.id, artworkId),
        eq(comicUniverseArtworks.collectionId, collectionId)
      ))
      .limit(1);

    if (existingArtwork.length === 0) {
      throw new Error(`作品不存在或不属于指定画集 (作品ID: ${artworkId}, 画集ID: ${collectionId})`);
    }

    const updatedArtwork = await db.update(comicUniverseArtworks)
      .set({
        title: artworkData.title,
        artist: artworkData.artist,
        image: artworkData.image,
        description: artworkData.description,
        createdTime: artworkData.createdTime,
        theme: artworkData.theme,
        updatedAt: new Date(),
      })
      .where(and(
        eq(comicUniverseArtworks.id, artworkId),
        eq(comicUniverseArtworks.collectionId, collectionId)
      ))
      .returning();

    if (updatedArtwork.length === 0) {
      throw new Error('更新作品失败，未返回数据');
    }

    // 清除画集缓存
    this.collectionsService.clearCache();

    return {
      id: updatedArtwork[0].id,
      title: updatedArtwork[0].title,
      artist: updatedArtwork[0].artist,
      image: updatedArtwork[0].image,
      description: updatedArtwork[0].description || undefined,
      createdTime: updatedArtwork[0].createdTime || undefined,
      theme: updatedArtwork[0].theme || undefined,
    };
  }

  // 删除作品
  async deleteArtwork(collectionId: number, artworkId: number): Promise<void> {
    await db.delete(comicUniverseArtworks)
      .where(and(
        eq(comicUniverseArtworks.id, artworkId),
        eq(comicUniverseArtworks.collectionId, collectionId)
      ));

    // 清除画集缓存
    this.collectionsService.clearCache();
  }

  // 更新作品显示顺序
  async updateArtworkOrder(collectionId: number, artworkOrders: { id: number; pageOrder: number }[]): Promise<void> {
    try {
      // 使用事务批量更新显示顺序
      await db.transaction(async (tx) => {
        for (const { id, pageOrder } of artworkOrders) {
          await tx
            .update(comicUniverseArtworks)
            .set({ 
              pageOrder,
              updatedAt: new Date()
            })
            .where(and(
              eq(comicUniverseArtworks.id, id),
              eq(comicUniverseArtworks.collectionId, collectionId)
            ));
        }
      });

      // 清除画集缓存
      this.collectionsService.clearCache();
    } catch (error) {
      console.error('更新作品顺序失败:', error);
      throw error;
    }
  }

  // 移动作品到指定位置
  async moveArtwork(collectionId: number, artworkId: number, targetOrder: number): Promise<void> {
    try {
      // 获取当前画集中的所有作品
      const artworks = await db
        .select({
          id: comicUniverseArtworks.id,
          pageOrder: comicUniverseArtworks.pageOrder,
        })
        .from(comicUniverseArtworks)
        .where(and(
          eq(comicUniverseArtworks.collectionId, collectionId),
          eq(comicUniverseArtworks.isActive, true)
        ))
        .orderBy(asc(comicUniverseArtworks.pageOrder));

      // 找到要移动的作品
      const targetArtwork = artworks.find(a => a.id === artworkId);
      if (!targetArtwork) {
        throw new Error('作品不存在');
      }

      // 确保目标位置在有效范围内
      if (targetOrder < 0 || targetOrder >= artworks.length) {
        throw new Error('目标位置无效');
      }

      // 重新计算所有作品的显示顺序
      const sortedArtworks = artworks.filter(a => a.id !== artworkId);
      sortedArtworks.splice(targetOrder, 0, targetArtwork);

      // 生成新的显示顺序
      const updates = sortedArtworks.map((artwork, index) => ({
        id: artwork.id,
        pageOrder: index,
      }));

      await this.updateArtworkOrder(collectionId, updates);
    } catch (error) {
      console.error('移动作品失败:', error);
      throw error;
    }
  }

  // 上移作品
  async moveArtworkUp(collectionId: number, artworkId: number): Promise<void> {
    try {
      const artworks = await db
        .select({
          id: comicUniverseArtworks.id,
          pageOrder: comicUniverseArtworks.pageOrder,
        })
        .from(comicUniverseArtworks)
        .where(and(
          eq(comicUniverseArtworks.collectionId, collectionId),
          eq(comicUniverseArtworks.isActive, true)
        ))
        .orderBy(asc(comicUniverseArtworks.pageOrder), asc(comicUniverseArtworks.id)); // 添加id作为次要排序

      // 检查并修复重复的pageOrder
      const pageOrders = artworks.map(a => a.pageOrder);
      const hasDuplicates = pageOrders.length !== new Set(pageOrders).size;
      
      if (hasDuplicates || artworks.some(a => a.pageOrder === null)) {
        console.log('检测到重复pageOrder，先修复顺序...');
        
        // 重新分配连续的pageOrder
        const fixUpdates = artworks.map((artwork, index) => ({
          id: artwork.id,
          pageOrder: index,
        }));
        
        await this.updateArtworkOrder(collectionId, fixUpdates);
        
        // 重新获取修复后的数据
        const fixedArtworks = await db
          .select({
            id: comicUniverseArtworks.id,
            pageOrder: comicUniverseArtworks.pageOrder,
          })
          .from(comicUniverseArtworks)
          .where(and(
            eq(comicUniverseArtworks.collectionId, collectionId),
            eq(comicUniverseArtworks.isActive, true)
          ))
          .orderBy(asc(comicUniverseArtworks.pageOrder));
          
        // 使用修复后的数据继续操作
        artworks.splice(0, artworks.length, ...fixedArtworks);
      }

      const currentIndex = artworks.findIndex(a => a.id === artworkId);
      if (currentIndex === -1) {
        throw new Error('作品不存在');
      }
      if (currentIndex === 0) {
        throw new Error('作品已经在最前面');
      }

      // 交换当前作品和前一个作品的顺序
      const targetIndex = currentIndex - 1;
      const currentOrder = artworks[targetIndex].pageOrder;
      const targetOrder = artworks[currentIndex].pageOrder;
      
      const updates = [
        { id: artworks[currentIndex].id, pageOrder: currentOrder },
        { id: artworks[targetIndex].id, pageOrder: targetOrder }
      ];

      await this.updateArtworkOrder(collectionId, updates);
    } catch (error) {
      console.error('上移作品失败:', error);
      throw error;
    }
  }

  // 下移作品
  async moveArtworkDown(collectionId: number, artworkId: number): Promise<void> {
    try {
      const artworks = await db
        .select({
          id: comicUniverseArtworks.id,
          pageOrder: comicUniverseArtworks.pageOrder,
        })
        .from(comicUniverseArtworks)
        .where(and(
          eq(comicUniverseArtworks.collectionId, collectionId),
          eq(comicUniverseArtworks.isActive, true)
        ))
        .orderBy(asc(comicUniverseArtworks.pageOrder), asc(comicUniverseArtworks.id)); // 添加id作为次要排序

      // 检查并修复重复的pageOrder
      const pageOrders = artworks.map(a => a.pageOrder);
      const hasDuplicates = pageOrders.length !== new Set(pageOrders).size;
      
      if (hasDuplicates || artworks.some(a => a.pageOrder === null)) {
        console.log('检测到重复pageOrder，先修复顺序...');
        
        // 重新分配连续的pageOrder
        const fixUpdates = artworks.map((artwork, index) => ({
          id: artwork.id,
          pageOrder: index,
        }));
        
        await this.updateArtworkOrder(collectionId, fixUpdates);
        
        // 重新获取修复后的数据
        const fixedArtworks = await db
          .select({
            id: comicUniverseArtworks.id,
            pageOrder: comicUniverseArtworks.pageOrder,
          })
          .from(comicUniverseArtworks)
          .where(and(
            eq(comicUniverseArtworks.collectionId, collectionId),
            eq(comicUniverseArtworks.isActive, true)
          ))
          .orderBy(asc(comicUniverseArtworks.pageOrder));
          
        // 使用修复后的数据继续操作
        artworks.splice(0, artworks.length, ...fixedArtworks);
      }

      // 添加调试信息
      console.log('下移作品后端调试信息:', {
        collectionId,
        artworkId,
        totalArtworks: artworks.length,
        artworkOrders: artworks.map(a => ({ id: a.id, pageOrder: a.pageOrder }))
      });

      const currentIndex = artworks.findIndex(a => a.id === artworkId);
      if (currentIndex === -1) {
        throw new Error('作品不存在');
      }
      if (currentIndex === artworks.length - 1) {
        throw new Error('作品已经在最后面');
      }

      // 交换当前作品和后一个作品的顺序
      const targetIndex = currentIndex + 1;
      const currentOrder = artworks[targetIndex].pageOrder;
      const targetOrder = artworks[currentIndex].pageOrder;
      
      console.log('下移交换信息:', {
        currentIndex,
        targetIndex,
        currentOrder,
        targetOrder,
        currentArtworkId: artworks[currentIndex].id,
        targetArtworkId: artworks[targetIndex].id
      });
      
      const updates = [
        { id: artworks[currentIndex].id, pageOrder: currentOrder },
        { id: artworks[targetIndex].id, pageOrder: targetOrder }
      ];

      await this.updateArtworkOrder(collectionId, updates);
    } catch (error) {
      console.error('下移作品失败:', error);
      throw error;
    }
  }

  // 获取指定画集的所有作品（按顺序）
  async getArtworksByCollection(collectionId: number): Promise<(ArtworkPage & { pageOrder: number })[]> {
    try {
      const artworks = await db
        .select({
          id: comicUniverseArtworks.id,
          title: comicUniverseArtworks.title,
          artist: comicUniverseArtworks.artist,
          image: comicUniverseArtworks.image,
          description: comicUniverseArtworks.description,
          createdTime: comicUniverseArtworks.createdTime,
          theme: comicUniverseArtworks.theme,
          pageOrder: comicUniverseArtworks.pageOrder,
        })
        .from(comicUniverseArtworks)
        .where(and(
          eq(comicUniverseArtworks.collectionId, collectionId),
          eq(comicUniverseArtworks.isActive, true)
        ))
        .orderBy(asc(comicUniverseArtworks.pageOrder), asc(comicUniverseArtworks.id)); // 添加id作为次要排序

      // 检查是否有重复的pageOrder，如果有则修复
      const pageOrders = artworks.map(a => a.pageOrder);
      const hasDuplicates = pageOrders.length !== new Set(pageOrders).size;
      
      if (hasDuplicates || artworks.some(a => a.pageOrder === null)) {
        console.log('检测到重复或空的pageOrder，开始修复...');
        
        // 重新分配连续的pageOrder
        const updates = artworks.map((artwork, index) => ({
          id: artwork.id,
          pageOrder: index,
        }));
        
        await this.updateArtworkOrder(collectionId, updates);
        
        // 重新查询修复后的数据
        const fixedArtworks = await db
          .select({
            id: comicUniverseArtworks.id,
            title: comicUniverseArtworks.title,
            artist: comicUniverseArtworks.artist,
            image: comicUniverseArtworks.image,
            description: comicUniverseArtworks.description,
            createdTime: comicUniverseArtworks.createdTime,
            theme: comicUniverseArtworks.theme,
            pageOrder: comicUniverseArtworks.pageOrder,
          })
          .from(comicUniverseArtworks)
          .where(and(
            eq(comicUniverseArtworks.collectionId, collectionId),
            eq(comicUniverseArtworks.isActive, true)
          ))
          .orderBy(asc(comicUniverseArtworks.pageOrder));
          
        return fixedArtworks.map(artwork => ({
          id: artwork.id,
          title: artwork.title,
          artist: artwork.artist,
          image: artwork.image,
          description: artwork.description || '',
          createdTime: artwork.createdTime || '',
          theme: artwork.theme || '',
          pageOrder: artwork.pageOrder,
        }));
      }

      return artworks.map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist,
        image: artwork.image,
        description: artwork.description || '',
        createdTime: artwork.createdTime || '',
        theme: artwork.theme || '',
        pageOrder: artwork.pageOrder,
      }));
    } catch (error) {
      console.error('获取作品列表失败:', error);
      throw error;
    }
  }
}

// 导出服务实例
export const masterpiecesConfigDbService = new MasterpiecesConfigDbService();
export const categoriesDbService = new CategoriesDbService();
export const tagsDbService = new TagsDbService();
export const collectionsDbService = new CollectionsDbService();
export const artworksDbService = new ArtworksDbService(collectionsDbService); 