/**
 * EventAwareMasterpiecesService - 活动感知的美术作品服务
 * 
 * 对原有MasterpiecesService的包装，添加了活动参数支持。
 * 保持向下兼容的同时，为多活动架构提供支持。
 */

import { MasterpiecesService } from './masterpiecesService';
import type { ArtCollection } from '../types';

/**
 * 活动感知的美术作品服务类
 */
export class EventAwareMasterpiecesService {
  /**
   * 获取所有画集数据（支持活动参数）
   * 
   * @param eventParam 活动参数，用于获取指定活动的画集
   * @returns Promise<ArtCollection[]> 画集数组
   */
  static async getAllCollections(eventParam?: string): Promise<ArtCollection[]> {
    const url = eventParam 
      ? `/api/showmasterpiece/collections?event=${encodeURIComponent(eventParam)}`
      : '/api/showmasterpiece/collections';
      
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('获取画集失败');
    }
    
    const result = await response.json();
    
    // 处理新的API响应格式 { success: true, data: [...] }
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    
    // 向下兼容旧格式（直接返回数组）
    if (Array.isArray(result)) {
      return result;
    }
    
    throw new Error('API响应格式错误');
  }

  /**
   * 根据ID获取特定画集（支持活动参数）
   * 
   * @param id 画集ID
   * @param eventParam 活动参数
   * @returns Promise<ArtCollection | null> 画集对象或null
   */
  static async getCollectionById(id: number, eventParam?: string): Promise<ArtCollection | null> {
    const collections = await this.getAllCollections(eventParam);
    return collections.find(collection => collection.id === id) || null;
  }

  /**
   * 根据分类获取画集（支持活动参数）
   * 
   * @param category 分类名称
   * @param eventParam 活动参数
   * @returns Promise<ArtCollection[]> 指定分类的画集数组
   */
  static async getCollectionsByCategory(category: string, eventParam?: string): Promise<ArtCollection[]> {
    const collections = await this.getAllCollections(eventParam);
    if (category === 'all') {
      return collections;
    }
    return collections.filter(collection => collection.category === category);
  }

  /**
   * 搜索画集（支持活动参数）
   * 
   * @param query 搜索关键词
   * @param eventParam 活动参数
   * @returns Promise<ArtCollection[]> 搜索结果数组
   */
  static async searchCollections(query: string, eventParam?: string): Promise<ArtCollection[]> {
    const collections = await this.getAllCollections(eventParam);
    if (!query.trim()) {
      return collections;
    }

    const searchTerm = query.toLowerCase();
    return collections.filter(collection => 
      collection.title.toLowerCase().includes(searchTerm) ||
      collection.description.toLowerCase().includes(searchTerm) ||
      collection.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * 获取推荐画集（支持活动参数）
   * 
   * @param currentCollectionId 当前画集ID
   * @param eventParam 活动参数
   * @param limit 推荐数量限制
   * @returns Promise<ArtCollection[]> 推荐画集数组
   */
  static async getRecommendedCollections(
    currentCollectionId: number, 
    eventParam?: string,
    limit: number = 4
  ): Promise<ArtCollection[]> {
    const collections = await this.getAllCollections(eventParam);
    const currentCollection = collections.find(c => c.id === currentCollectionId);
    
    if (!currentCollection) {
      return collections.slice(0, limit);
    }

    // 简单的推荐算法：基于分类和标签的相似性
    const recommendedCollections = collections
      .filter(collection => collection.id !== currentCollectionId)
      .map(collection => {
        let score = 0;
        
        // 相同分类加分
        if (collection.category === currentCollection.category) {
          score += 3;
        }
        
        // 共同标签加分
        const commonTags = collection.tags?.filter(tag => 
          currentCollection.tags?.some(currentTag => currentTag === tag)
        ) || [];
        score += commonTags.length * 2;
        
        return { collection, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.collection);

    return recommendedCollections;
  }
}

// 为了向下兼容，也导出原有的函数式接口
export const getEventAwareMasterpieces = async (eventParam?: string): Promise<ArtCollection[]> => {
  return EventAwareMasterpiecesService.getAllCollections(eventParam);
};
