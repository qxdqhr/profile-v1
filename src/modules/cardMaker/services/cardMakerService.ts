import { CardData, AssetItem } from '../types';

export class CardMakerService {
  // 获取名片列表
  static async getCards(userId?: string): Promise<CardData[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    
    const response = await fetch(`/api/cardMaker/cards?${params}`);
    if (!response.ok) throw new Error('Failed to fetch cards');
    return response.json();
  }

  // 保存名片
  static async saveCard(card: CardData): Promise<CardData> {
    const response = await fetch('/api/cardMaker/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(card),
    });
    
    if (!response.ok) throw new Error('Failed to save card');
    return response.json();
  }

  // 更新名片
  static async updateCard(id: string, card: Partial<CardData>): Promise<CardData> {
    const response = await fetch(`/api/cardMaker/cards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(card),
    });
    
    if (!response.ok) throw new Error('Failed to update card');
    return response.json();
  }

  // 获取特定名片
  static async getCard(id: string): Promise<CardData> {
    const response = await fetch(`/api/cardMaker/cards/${id}`);
    if (!response.ok) throw new Error('Failed to fetch card');
    return response.json();
  }

  // 删除名片
  static async deleteCard(id: string): Promise<void> {
    const response = await fetch(`/api/cardMaker/cards/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Failed to delete card');
  }

  // 获取资源列表
  static async getAssets(category?: string, type?: string): Promise<AssetItem[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (type) params.append('type', type);
    
    const response = await fetch(`/api/cardMaker/assets?${params}`);
    if (!response.ok) throw new Error('Failed to fetch assets');
    return response.json();
  }

  // 上传资源
  static async uploadAsset(file: File, type: string, category: string, name: string): Promise<AssetItem> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('category', category);
    formData.append('name', name);
    
    const response = await fetch('/api/cardMaker/assets/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Failed to upload asset');
    return response.json();
  }

  // 获取资源分类
  static async getAssetCategories(): Promise<string[]> {
    const response = await fetch('/api/cardMaker/assets/categories');
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  }
}