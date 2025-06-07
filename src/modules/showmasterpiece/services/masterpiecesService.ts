import type { ArtCollection } from '../types';

export const getMasterpieces = async (): Promise<ArtCollection[]> => {
  const response = await fetch('/api/masterpieces/collections');
  if (!response.ok) {
    throw new Error('获取画集失败');
  }
  return await response.json();
};

export class MasterpiecesService {
  /**
   * 获取所有画集
   */
  static async getAllCollections(): Promise<ArtCollection[]> {
    const response = await fetch('/api/masterpieces/collections');
    if (!response.ok) {
      throw new Error('获取画集失败');
    }
    return await response.json();
  }

  /**
   * 根据ID获取特定画集
   */
  static async getCollectionById(id: number): Promise<ArtCollection | null> {
    const collections = await this.getAllCollections();
    return collections.find(c => c.id === id) || null;
  }

  /**
   * 搜索画集
   */
  static async searchCollections(query: string): Promise<ArtCollection[]> {
    const collections = await this.getAllCollections();
    const searchTerm = query.toLowerCase();
    
    return collections.filter((collection: ArtCollection) => 
      collection.title.toLowerCase().includes(searchTerm) ||
      collection.artist.toLowerCase().includes(searchTerm) ||
      collection.description.toLowerCase().includes(searchTerm) ||
      (collection.category && collection.category.toLowerCase().includes(searchTerm)) ||
      (collection.tags && collection.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm)))
    );
  }

  /**
   * 根据分类获取画集
   */
  static async getCollectionsByCategory(category: string): Promise<ArtCollection[]> {
    const collections = await this.getAllCollections();
    
    if (category === 'all') {
      return collections;
    }
    
    return collections.filter((collection: ArtCollection) => collection.category === category);
  }

  /**
   * 获取推荐画集
   */
  static async getRecommendedCollections(limit: number = 3): Promise<ArtCollection[]> {
    const collections = await this.getAllCollections();
    
    // 简单的推荐逻辑：返回已发布的画集，按作品数量排序
    return collections
      .filter((collection: ArtCollection) => collection.isPublished !== false)
      .sort((a: ArtCollection, b: ArtCollection) => b.pages.length - a.pages.length)
      .slice(0, limit);
  }

  /**
   * 获取分类列表
   */
  static async getCategories(): Promise<string[]> {
    const response = await fetch('/api/masterpieces/categories');
    if (!response.ok) {
      throw new Error('获取分类失败');
    }
    return await response.json();
  }

  /**
   * 获取标签列表
   */
  static async getTags(): Promise<string[]> {
    const response = await fetch('/api/masterpieces/tags');
    if (!response.ok) {
      throw new Error('获取标签失败');
    }
    return await response.json();
  }
} 