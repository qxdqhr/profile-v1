/**
 * 通用导出服务数据库操作层
 */

import { db } from '@/db';
import { exportConfigs, exportHistory, type ExportConfig, type NewExportConfig, type ExportHistory, type NewExportHistory } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { ExportField } from './types';

/**
 * 导出配置数据库服务
 */
export class ExportConfigDatabaseService {
  /**
   * 创建导出配置
   */
  async createConfig(config: Omit<NewExportConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExportConfig> {
    const [newConfig] = await db
      .insert(exportConfigs)
      .values({
        ...config,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newConfig;
  }

  /**
   * 根据ID获取配置
   */
  async getConfigById(id: string): Promise<ExportConfig | null> {
    const [config] = await db
      .select()
      .from(exportConfigs)
      .where(eq(exportConfigs.id, id))
      .limit(1);

    return config || null;
  }

  /**
   * 根据模块和业务ID获取配置列表
   */
  async getConfigsByModule(moduleId: string, businessId?: string): Promise<ExportConfig[]> {
    const whereConditions = businessId 
      ? and(eq(exportConfigs.moduleId, moduleId), eq(exportConfigs.businessId, businessId))
      : eq(exportConfigs.moduleId, moduleId);

    return await db
      .select()
      .from(exportConfigs)
      .where(whereConditions)
      .orderBy(desc(exportConfigs.updatedAt));
  }

  /**
   * 更新配置
   */
  async updateConfig(id: string, updates: Partial<Omit<ExportConfig, 'id' | 'createdAt'>>): Promise<ExportConfig | null> {
    const [updatedConfig] = await db
      .update(exportConfigs)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(exportConfigs.id, id))
      .returning();

    return updatedConfig || null;
  }

  /**
   * 删除配置
   */
  async deleteConfig(id: string): Promise<boolean> {
    await db
      .delete(exportConfigs)
      .where(eq(exportConfigs.id, id));

    return true;
  }

  /**
   * 根据用户ID获取配置列表
   */
  async getConfigsByUser(userId: string): Promise<ExportConfig[]> {
    return await db
      .select()
      .from(exportConfigs)
      .where(eq(exportConfigs.createdBy, userId))
      .orderBy(desc(exportConfigs.updatedAt));
  }
}

/**
 * 导出历史记录数据库服务
 */
export class ExportHistoryDatabaseService {
  /**
   * 创建导出历史记录
   */
  async createHistory(history: Omit<NewExportHistory, 'id' | 'createdAt'>): Promise<ExportHistory> {
    const [newHistory] = await db
      .insert(exportHistory)
      .values({
        ...history,
        createdAt: new Date(),
      })
      .returning();

    return newHistory;
  }

  /**
   * 根据配置ID获取历史记录
   */
  async getHistoryByConfigId(configId: string): Promise<ExportHistory[]> {
    return await db
      .select()
      .from(exportHistory)
      .where(eq(exportHistory.configId, configId))
      .orderBy(desc(exportHistory.createdAt));
  }

  /**
   * 根据用户ID获取历史记录
   */
  async getHistoryByUser(userId: string): Promise<ExportHistory[]> {
    return await db
      .select()
      .from(exportHistory)
      .where(eq(exportHistory.createdBy, userId))
      .orderBy(desc(exportHistory.createdAt));
  }

  /**
   * 获取最近的导出历史记录
   */
  async getRecentHistory(limit: number = 10): Promise<ExportHistory[]> {
    return await db
      .select()
      .from(exportHistory)
      .orderBy(desc(exportHistory.createdAt))
      .limit(limit);
  }
}

// 导出服务实例
export const exportConfigDB = new ExportConfigDatabaseService();
export const exportHistoryDB = new ExportHistoryDatabaseService(); 