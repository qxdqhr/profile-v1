import { db } from '../index';
import { 
  comicUniverseConfigs,
  comicUniverseCategories,
  comicUniverseTags,
  comicUniverseCollections,
  comicUniverseCollectionTags,
  comicUniverseArtworks
} from '../schema/masterpieces';
import { eq, desc, asc, and, sql, inArray } from 'drizzle-orm';
import type { 
  MasterpiecesConfig, 
  ArtCollection, 
  ArtworkPage,
  CollectionFormData,
  ArtworkFormData 
} from '@/types/masterpieces';

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
  // 获取所有画集
  async getAllCollections(): Promise<ArtCollection[]> {
    const collections = await db.select()
      .from(comicUniverseCollections)
      .where(eq(comicUniverseCollections.isPublished, true))
      .orderBy(desc(comicUniverseCollections.displayOrder), desc(comicUniverseCollections.createdAt));

    const result: ArtCollection[] = [];

    for (const collection of collections) {
      // 获取画集的作品
      const artworks = await db.select()
        .from(comicUniverseArtworks)
        .where(and(
          eq(comicUniverseArtworks.collectionId, collection.id),
          eq(comicUniverseArtworks.isActive, true)
        ))
        .orderBy(asc(comicUniverseArtworks.pageOrder));

      // 获取分类名称
      let categoryName = '';
      if (collection.categoryId) {
        const category = await db.select()
          .from(comicUniverseCategories)
          .where(eq(comicUniverseCategories.id, collection.categoryId))
          .limit(1);
        categoryName = category[0]?.name || '';
      }

      // 获取标签
      const collectionTags = await db.select({
        tagName: comicUniverseTags.name
      })
        .from(comicUniverseCollectionTags)
        .innerJoin(comicUniverseTags, eq(comicUniverseCollectionTags.tagId, comicUniverseTags.id))
        .where(eq(comicUniverseCollectionTags.collectionId, collection.id));

      result.push({
        id: collection.id,
        title: collection.title,
        artist: collection.artist,
        coverImage: collection.coverImage,
        description: collection.description || '',
        category: categoryName,
        tags: collectionTags.map(ct => ct.tagName),
        isPublished: collection.isPublished,
        pages: artworks.map(artwork => ({
          id: artwork.id,
          title: artwork.title,
          artist: artwork.artist,
          image: artwork.image,
          description: artwork.description || undefined,
          year: artwork.year || undefined,
          medium: artwork.medium || undefined,
        }))
      });
    }

    return result;
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

    // 返回完整的画集数据
    const collections = await this.getAllCollections();
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

    // 返回更新后的画集数据
    const collections = await this.getAllCollections();
    return collections.find(c => c.id === id)!;
  }

  // 删除画集
  async deleteCollection(id: number): Promise<void> {
    await db.delete(comicUniverseCollections)
      .where(eq(comicUniverseCollections.id, id));
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
}

// 作品相关服务
export class ArtworksDbService {
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
      year: artworkData.year,
      medium: artworkData.medium,
      pageOrder: newOrder,
    }).returning();

    return {
      id: newArtwork[0].id,
      title: newArtwork[0].title,
      artist: newArtwork[0].artist,
      image: newArtwork[0].image,
      description: newArtwork[0].description || undefined,
      year: newArtwork[0].year || undefined,
      medium: newArtwork[0].medium || undefined,
    };
  }

  // 更新作品
  async updateArtwork(collectionId: number, artworkId: number, artworkData: ArtworkFormData): Promise<ArtworkPage> {
    const updatedArtwork = await db.update(comicUniverseArtworks)
      .set({
        title: artworkData.title,
        artist: artworkData.artist,
        image: artworkData.image,
        description: artworkData.description,
        year: artworkData.year,
        medium: artworkData.medium,
        updatedAt: new Date(),
      })
      .where(and(
        eq(comicUniverseArtworks.id, artworkId),
        eq(comicUniverseArtworks.collectionId, collectionId)
      ))
      .returning();

    return {
      id: updatedArtwork[0].id,
      title: updatedArtwork[0].title,
      artist: updatedArtwork[0].artist,
      image: updatedArtwork[0].image,
      description: updatedArtwork[0].description || undefined,
      year: updatedArtwork[0].year || undefined,
      medium: updatedArtwork[0].medium || undefined,
    };
  }

  // 删除作品
  async deleteArtwork(collectionId: number, artworkId: number): Promise<void> {
    await db.delete(comicUniverseArtworks)
      .where(and(
        eq(comicUniverseArtworks.id, artworkId),
        eq(comicUniverseArtworks.collectionId, collectionId)
      ));
  }
}

// 导出服务实例
export const masterpiecesConfigDbService = new MasterpiecesConfigDbService();
export const categoriesDbService = new CategoriesDbService();
export const tagsDbService = new TagsDbService();
export const collectionsDbService = new CollectionsDbService();
export const artworksDbService = new ArtworksDbService(); 