/**
 * 数据库配置同步服务
 * 
 * 将配置管理模块中的数据库相关配置同步到环境变量
 * 注意：数据库连接字符串（DATABASE_URL）始终从.env文件读取，不在此服务中管理
 */

import { EnvConfigService } from './envConfigService';

export class DatabaseConfigSync {
  private static instance: DatabaseConfigSync;
  private readonly databaseConfigKeys = [
    'DATABASE_POOL_SIZE',
    'DATABASE_TIMEOUT', 
    'DATABASE_SSL_MODE'
  ];

  private constructor() {}

  public static getInstance(): DatabaseConfigSync {
    if (!DatabaseConfigSync.instance) {
      DatabaseConfigSync.instance = new DatabaseConfigSync();
    }
    return DatabaseConfigSync.instance;
  }

  /**
   * 同步数据库配置到环境变量
   */
  async syncDatabaseConfig(): Promise<void> {
    try {
      console.log('🔄 [DatabaseConfigSync] 开始同步数据库配置...');
      
      const envService = EnvConfigService.getInstance();
      const cachedConfig = envService.getCachedConfig();
      
      let syncCount = 0;
      
      // 只同步数据库相关的配置项
      for (const key of this.databaseConfigKeys) {
        const value = cachedConfig[key];
        if (value !== undefined) {
          // 只在开发环境下设置环境变量
          if (process.env.NODE_ENV === 'development') {
            process.env[key] = value;
            console.log(`  ${key} = ${value}`);
            syncCount++;
          }
        }
      }
      
      console.log(`✅ [DatabaseConfigSync] 数据库配置同步完成，更新了 ${syncCount} 个配置项`);
      
    } catch (error) {
      console.error('❌ [DatabaseConfigSync] 同步数据库配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前数据库配置
   */
  getCurrentDatabaseConfig(): Record<string, string> {
    const config: Record<string, string> = {};
    
    for (const key of this.databaseConfigKeys) {
      const value = process.env[key];
      if (value !== undefined) {
        config[key] = value;
      }
    }
    
    return config;
  }

  /**
   * 验证数据库配置完整性
   */
  validateDatabaseConfig(): { valid: boolean; missing: string[]; errors: string[] } {
    const missing: string[] = [];
    const errors: string[] = [];
    
    // 检查必需的数据库连接URL
    if (!process.env.DATABASE_URL) {
      missing.push('DATABASE_URL');
      errors.push('数据库连接URL未设置');
    }
    
    // 检查数据库配置项（可选）
    const poolSize = process.env.DATABASE_POOL_SIZE;
    if (poolSize && (isNaN(parseInt(poolSize)) || parseInt(poolSize) <= 0)) {
      errors.push('DATABASE_POOL_SIZE 必须是正整数');
    }
    
    const timeout = process.env.DATABASE_TIMEOUT;
    if (timeout && (isNaN(parseInt(timeout)) || parseInt(timeout) <= 0)) {
      errors.push('DATABASE_TIMEOUT 必须是正整数');
    }
    
    const sslMode = process.env.DATABASE_SSL_MODE;
    if (sslMode && !['require', 'prefer', 'allow', 'disable'].includes(sslMode)) {
      errors.push('DATABASE_SSL_MODE 必须是 require, prefer, allow 或 disable');
    }
    
    return {
      valid: missing.length === 0 && errors.length === 0,
      missing,
      errors
    };
  }

  /**
   * 获取数据库配置说明
   */
  getDatabaseConfigDescription(): Record<string, string> {
    return {
      DATABASE_URL: '数据库连接字符串（必须从.env文件设置）',
      DATABASE_POOL_SIZE: '数据库连接池大小（可选，默认10）',
      DATABASE_TIMEOUT: '数据库连接超时时间（可选，默认5000ms）',
      DATABASE_SSL_MODE: '数据库SSL模式（可选，默认prefer）'
    };
  }
}

// 导出单例实例
export const databaseConfigSync = DatabaseConfigSync.getInstance(); 