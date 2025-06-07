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
  // 缓存配置
  private collectionsCache: ArtCollection[] | null = null;
  private collectionsCacheTime: number = 0;
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2分钟缓存

  // 获取所有画集 - 优化版本
  async getAllCollections(useCache: boolean = true): Promise<ArtCollection[]> {
    // 检查缓存
    if (useCache && this.collectionsCache && (Date.now() - this.collectionsCacheTime) < this.CACHE_DURATION) {
      return this.collectionsCache;
    }

    try {
      // 1. 首先获取画集基本信息（不包含作品）
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

      // 2. 并行获取分类、标签和作品数据
      const [categories, tags, artworks] = await Promise.all([
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

        // 获取作品信息（只选择必要字段）
        db
          .select({
            collectionId: comicUniverseArtworks.collectionId,
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
          .where(
            and(
              inArray(comicUniverseArtworks.collectionId, collectionIds),
              eq(comicUniverseArtworks.isActive, true)
            )
          )
          .orderBy(asc(comicUniverseArtworks.pageOrder))
      ]);

      // 3. 构建映射表以提高查找效率
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
          image: artwork.image || '',
          description: artwork.description || '',
          createdTime: artwork.createdTime || '',
          theme: artwork.theme || '',
        });
      });

      // 4. 构建最终结果
      const result: ArtCollection[] = collections.map(collection => ({
        id: collection.id,
        title: collection.title,
        artist: collection.artist,
        coverImage: collection.coverImage,
        description: collection.description || '',
        category: collection.categoryId ? (categoriesMap.get(collection.categoryId) || '') : '',
        tags: tagsMap.get(collection.id) || [],
        isPublished: collection.isPublished,
        pages: artworksMap.get(collection.id) || [],
      }));

      // 5. 更新缓存
      this.collectionsCache = result;
      this.collectionsCacheTime = Date.now();

      return result;

    } catch (error) {
      console.error('获取画集数据失败:', error);
      throw error;
    }
  }

  // 清除缓存的方法
  clearCache(): void {
    this.collectionsCache = null;
    this.collectionsCacheTime = 0;
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

  // 获取画集概览（不包含作品详情，用于列表展示）
  async getCollectionsOverview(): Promise<Omit<ArtCollection, 'pages'>[]> {
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
}

// 导出服务实例
export const masterpiecesConfigDbService = new MasterpiecesConfigDbService();
export const categoriesDbService = new CategoriesDbService();
export const tagsDbService = new TagsDbService();
export const collectionsDbService = new CollectionsDbService();
export const artworksDbService = new ArtworksDbService(collectionsDbService); 