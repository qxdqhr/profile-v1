/**
 * TestYourself 配置服务
 * Configuration Service for TestYourself
 */

import { db, isDatabaseAvailable } from './db';
import {
  ConfigService,
  createDatabaseConfigAdapter,
  createConfigService as createBaseConfigService,
} from 'sa2kit/testYourself/server';
import type { ConfigServiceOptions } from 'sa2kit/testYourself/server';

/**
 * 创建配置服务
 * 
 * 根据环境自动选择存储方式：
 * - 如果有 DATABASE_URL，使用数据库存储
 * - 否则使用 localStorage（浏览器环境）或内存存储（SSR）
 */
export function createTestConfigService(userId?: string, organizationId?: string) {
  // 如果数据库可用，使用数据库适配器
  if (isDatabaseAvailable() && db) {
    console.log('✅ 使用数据库存储配置');
    
    const dbAdapter = createDatabaseConfigAdapter({
      db,
      userId: userId || 'example-user',
      organizationId,
      softDelete: true,
    });

    const configService = new ConfigService({
      storageType: 'custom',
      customStorage: dbAdapter,
      enableCache: true,
    });

    return { configService, dbAdapter, storageType: 'database' as const };
  }

  // 否则使用 localStorage（浏览器）或内存（SSR）
  console.log('ℹ️ 使用 localStorage/内存存储配置');
  
  const options: ConfigServiceOptions = {
    storageType: typeof window !== 'undefined' ? 'localStorage' : 'memory',
    enableCache: true,
  };

  const configService = createBaseConfigService(options);
  
  return { configService, dbAdapter: null, storageType: options.storageType };
}

/**
 * 获取配置服务单例
 */
let globalConfigService: ReturnType<typeof createTestConfigService> | null = null;

export function getConfigService(userId?: string): ReturnType<typeof createTestConfigService> {
  if (!globalConfigService) {
    globalConfigService = createTestConfigService(userId);
  }
  return globalConfigService;
}










