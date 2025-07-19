import { db } from '@/db/index';
import { configCategories, configItems, configHistory, configPermissions } from './schema';
import { eq, and, like, desc, asc, sql } from 'drizzle-orm';
import { 
  ConfigCategory, 
  ConfigItem, 
  ConfigHistory, 
  ConfigPermission,
  ConfigSearchParams,
  PaginatedResponse 
} from '../types';

export class ConfigDbService {
  // ============= 配置分类管理 =============

  /**
   * 获取所有配置分类
   */
  async getAllCategories(): Promise<ConfigCategory[]> {
    return await db
      .select()
      .from(configCategories)
      .where(eq(configCategories.isActive, true))
      .orderBy(asc(configCategories.sortOrder), asc(configCategories.displayName));
  }

  /**
   * 根据ID获取配置分类
   */
  async getCategoryById(id: string): Promise<ConfigCategory | null> {
    const [category] = await db
      .select()
      .from(configCategories)
      .where(eq(configCategories.id, id))
      .limit(1);
    
    return category || null;
  }

  /**
   * 创建配置分类
   */
  async createCategory(category: Omit<ConfigCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigCategory> {
    const [newCategory] = await db
      .insert(configCategories)
      .values(category)
      .returning();
    
    return newCategory;
  }

  /**
   * 更新配置分类
   */
  async updateCategory(id: string, updates: Partial<ConfigCategory>): Promise<ConfigCategory | null> {
    const [updatedCategory] = await db
      .update(configCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(configCategories.id, id))
      .returning();
    
    return updatedCategory || null;
  }

  /**
   * 删除配置分类
   */
  async deleteCategory(id: string): Promise<boolean> {
    await db
      .delete(configCategories)
      .where(eq(configCategories.id, id));
    
    return true;
  }

  // ============= 配置项管理 =============

  /**
   * 获取配置项列表（支持分页和搜索）
   */
  async getConfigItems(params: ConfigSearchParams = {}): Promise<PaginatedResponse<ConfigItem>> {
    const { 
      categoryId, 
      search, 
      type, 
      isActive = true, 
      page = 1, 
      pageSize = 20 
    } = params;

    // 构建查询条件
    const conditions = [eq(configItems.isActive, isActive)];
    
    if (categoryId) {
      conditions.push(eq(configItems.categoryId, categoryId));
    }
    
    if (search) {
      conditions.push(
        like(configItems.displayName, `%${search}%`)
      );
    }
    
    if (type) {
      conditions.push(eq(configItems.type, type));
    }

    // 获取总数
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(configItems)
      .where(and(...conditions));

    // 获取分页数据
    const items = await db
      .select()
      .from(configItems)
      .where(and(...conditions))
      .orderBy(asc(configItems.sortOrder), asc(configItems.displayName))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const totalPages = Math.ceil(count / pageSize);

    return {
      items,
      total: count,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  /**
   * 根据ID获取配置项
   */
  async getConfigItemById(id: string): Promise<ConfigItem | null> {
    const [item] = await db
      .select()
      .from(configItems)
      .where(eq(configItems.id, id))
      .limit(1);
    
    return item || null;
  }

  /**
   * 根据键获取配置项
   */
  async getConfigItemByKey(key: string): Promise<ConfigItem | null> {
    const [item] = await db
      .select()
      .from(configItems)
      .where(eq(configItems.key, key))
      .limit(1);
    
    return item || null;
  }

  /**
   * 获取所有配置项（不分页）
   */
  async getAllConfigItems(): Promise<ConfigItem[]> {
    return await db
      .select()
      .from(configItems)
      .where(eq(configItems.isActive, true))
      .orderBy(asc(configItems.sortOrder), asc(configItems.displayName));
  }

  /**
   * 根据键更新配置项
   */
  async updateConfigItemByKey(key: string, updates: Partial<ConfigItem>): Promise<ConfigItem | null> {
    const [updatedItem] = await db
      .update(configItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(configItems.key, key))
      .returning();
    
    return updatedItem || null;
  }

  /**
   * 创建配置项
   */
  async createConfigItem(item: Omit<ConfigItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigItem> {
    const [newItem] = await db
      .insert(configItems)
      .values(item)
      .returning();
    
    return newItem;
  }

  /**
   * 更新配置项
   */
  async updateConfigItem(id: string, updates: Partial<ConfigItem>): Promise<ConfigItem | null> {
    const [updatedItem] = await db
      .update(configItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(configItems.id, id))
      .returning();
    
    return updatedItem || null;
  }

  /**
   * 批量更新配置项
   */
  async batchUpdateConfigItems(updates: Array<{ id: string; value: string }>): Promise<ConfigItem[]> {
    const updatedItems: ConfigItem[] = [];
    
    for (const update of updates) {
      const [updatedItem] = await db
        .update(configItems)
        .set({ value: update.value, updatedAt: new Date() })
        .where(eq(configItems.id, update.id))
        .returning();
      
      if (updatedItem) {
        updatedItems.push(updatedItem);
      }
    }
    
    return updatedItems;
  }

  /**
   * 删除配置项
   */
  async deleteConfigItem(id: string): Promise<boolean> {
    await db
      .delete(configItems)
      .where(eq(configItems.id, id));
    
    return true;
  }

  // ============= 配置历史管理 =============

  /**
   * 记录配置变更历史
   */
  async recordConfigHistory(
    configItemId: string, 
    oldValue: string | null, 
    newValue: string, 
    changedBy: string, 
    changeReason?: string
  ): Promise<ConfigHistory> {
    const [history] = await db
      .insert(configHistory)
      .values({
        configItemId,
        oldValue,
        newValue,
        changedBy,
        changeReason
      })
      .returning();
    
    return history;
  }

  /**
   * 获取配置项的历史记录
   */
  async getConfigHistory(configItemId: string, limit = 50): Promise<ConfigHistory[]> {
    return await db
      .select()
      .from(configHistory)
      .where(eq(configHistory.configItemId, configItemId))
      .orderBy(desc(configHistory.createdAt))
      .limit(limit);
  }

  // ============= 权限管理 =============

  /**
   * 检查用户对配置分类的权限
   */
  async checkUserPermission(userId: string, categoryId: string): Promise<ConfigPermission | null> {
    const [permission] = await db
      .select()
      .from(configPermissions)
      .where(
        and(
          eq(configPermissions.userId, userId),
          eq(configPermissions.categoryId, categoryId)
        )
      )
      .limit(1);
    
    return permission || null;
  }

  /**
   * 为用户分配配置权限
   */
  async assignUserPermission(permission: Omit<ConfigPermission, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigPermission> {
    const [newPermission] = await db
      .insert(configPermissions)
      .values(permission)
      .returning();
    
    return newPermission;
  }

  /**
   * 更新用户权限
   */
  async updateUserPermission(id: string, updates: Partial<ConfigPermission>): Promise<ConfigPermission | null> {
    const [updatedPermission] = await db
      .update(configPermissions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(configPermissions.id, id))
      .returning();
    
    return updatedPermission || null;
  }

  /**
   * 删除用户权限
   */
  async deleteUserPermission(id: string): Promise<boolean> {
    await db
      .delete(configPermissions)
      .where(eq(configPermissions.id, id));
    
    return true;
  }
}

// 导出单例实例
export const configDbService = new ConfigDbService(); 