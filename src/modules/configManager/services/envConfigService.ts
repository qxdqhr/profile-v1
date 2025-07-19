/**
 * 环境变量配置服务
 * 
 * 从配置管理模块读取配置项，并动态设置环境变量
 * 支持运行时更新环境变量，无需重启应用
 */

import { configDbService } from '../db/configDbService';

export interface EnvConfig {
  [key: string]: string;
}

export class EnvConfigService {
  private static instance: EnvConfigService;
  private configCache: Map<string, string> = new Map();
  private lastUpdateTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  private constructor() {}

  public static getInstance(): EnvConfigService {
    if (!EnvConfigService.instance) {
      EnvConfigService.instance = new EnvConfigService();
    }
    return EnvConfigService.instance;
  }

  /**
   * 从数据库加载所有配置项
   */
  async loadConfigFromDatabase(): Promise<EnvConfig> {
    try {
      console.log('🔧 [EnvConfigService] 开始从数据库加载配置...');
      
      // 获取所有配置项
      const allConfigItems = await configDbService.getAllConfigItems();
      
      const envConfig: EnvConfig = {};
      
      // 将配置项转换为环境变量格式
      for (const item of allConfigItems) {
        if (item.isActive && item.value !== null && item.value !== undefined) {
          envConfig[item.key] = item.value;
          this.configCache.set(item.key, item.value);
        }
      }
      
      this.lastUpdateTime = Date.now();
      
      console.log('✅ [EnvConfigService] 配置加载完成:', {
        totalItems: allConfigItems.length,
        activeItems: Object.keys(envConfig).length,
        keys: Object.keys(envConfig)
      });
      
      return envConfig;
    } catch (error) {
      console.error('❌ [EnvConfigService] 从数据库加载配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个配置项的值
   */
  async getConfigValue(key: string): Promise<string | null> {
    // 检查缓存
    if (this.configCache.has(key)) {
      const cacheAge = Date.now() - this.lastUpdateTime;
      if (cacheAge < this.CACHE_DURATION) {
        return this.configCache.get(key) || null;
      }
    }
    
    try {
      const configItem = await configDbService.getConfigItemByKey(key);
      if (configItem && configItem.isActive) {
        this.configCache.set(key, configItem.value || '');
        return configItem.value;
      }
      return null;
    } catch (error) {
      console.error(`❌ [EnvConfigService] 获取配置项 ${key} 失败:`, error);
      return null;
    }
  }

  /**
   * 设置环境变量
   */
  setEnvironmentVariables(envConfig: EnvConfig): void {
    console.log('🔧 [EnvConfigService] 开始设置环境变量...');
    
    for (const [key, value] of Object.entries(envConfig)) {
      // 只在开发环境下设置，生产环境应该通过系统环境变量管理
      if (process.env.NODE_ENV === 'development') {
        process.env[key] = value;
        console.log(`  ${key} = ${this.maskSensitiveValue(key, value)}`);
      }
    }
    
    console.log('✅ [EnvConfigService] 环境变量设置完成');
  }

  /**
   * 更新配置项并刷新环境变量
   */
  async updateConfigAndRefresh(key: string, value: string): Promise<void> {
    try {
      console.log(`🔄 [EnvConfigService] 更新配置项: ${key}`);
      
      // 更新数据库中的配置项
      await configDbService.updateConfigItemByKey(key, { value });
      
      // 更新缓存
      this.configCache.set(key, value);
      
      // 在开发环境下更新环境变量
      if (process.env.NODE_ENV === 'development') {
        process.env[key] = value;
        console.log(`✅ [EnvConfigService] 环境变量已更新: ${key} = ${this.maskSensitiveValue(key, value)}`);
      }
      
    } catch (error) {
      console.error(`❌ [EnvConfigService] 更新配置项失败:`, error);
      throw error;
    }
  }

  /**
   * 批量更新配置项
   */
  async batchUpdateConfigAndRefresh(updates: Array<{ key: string; value: string }>): Promise<void> {
    try {
      console.log(`🔄 [EnvConfigService] 批量更新配置项: ${updates.length} 项`);
      
      for (const update of updates) {
        // 更新数据库中的配置项
        await configDbService.updateConfigItemByKey(update.key, { value: update.value });
        
        // 更新缓存
        this.configCache.set(update.key, update.value);
        
        // 在开发环境下更新环境变量
        if (process.env.NODE_ENV === 'development') {
          process.env[update.key] = update.value;
        }
      }
      
      console.log('✅ [EnvConfigService] 批量更新完成');
      
    } catch (error) {
      console.error('❌ [EnvConfigService] 批量更新配置项失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前缓存的所有配置
   */
  getCachedConfig(): EnvConfig {
    const envConfig: EnvConfig = {};
    for (const [key, value] of this.configCache.entries()) {
      envConfig[key] = value;
    }
    return envConfig;
  }

  /**
   * 清除缓存并重新加载
   */
  async refreshCache(): Promise<void> {
    console.log('🔄 [EnvConfigService] 清除缓存并重新加载...');
    this.configCache.clear();
    this.lastUpdateTime = 0;
    await this.loadConfigFromDatabase();
  }

  /**
   * 检查配置是否完整
   */
  async validateRequiredConfig(): Promise<{ valid: boolean; missing: string[] }> {
    try {
      const allConfigItems = await configDbService.getAllConfigItems();
      const requiredItems = allConfigItems.filter((item: any) => item.isRequired);
      const missingItems: string[] = [];
      
      for (const item of requiredItems) {
        if (!item.value || item.value.trim() === '') {
          missingItems.push(item.key);
        }
      }
      
      return {
        valid: missingItems.length === 0,
        missing: missingItems
      };
    } catch (error) {
      console.error('❌ [EnvConfigService] 验证配置失败:', error);
      return { valid: false, missing: ['验证失败'] };
    }
  }

  /**
   * 获取配置统计信息
   */
  async getConfigStats(): Promise<{
    total: number;
    active: number;
    required: number;
    sensitive: number;
    categories: { [key: string]: number };
  }> {
    try {
      const allConfigItems = await configDbService.getAllConfigItems();
      
      const stats = {
        total: allConfigItems.length,
        active: allConfigItems.filter((item: any) => item.isActive).length,
        required: allConfigItems.filter((item: any) => item.isRequired).length,
        sensitive: allConfigItems.filter((item: any) => item.isSensitive).length,
        categories: {} as { [key: string]: number }
      };
      
      // 按分类统计
      for (const item of allConfigItems) {
        if (item.categoryId) {
          const category = await configDbService.getCategoryById(item.categoryId);
          if (category) {
            stats.categories[category.name] = (stats.categories[category.name] || 0) + 1;
          }
        }
      }
      
      return stats;
    } catch (error) {
      console.error('❌ [EnvConfigService] 获取配置统计失败:', error);
      return {
        total: 0,
        active: 0,
        required: 0,
        sensitive: 0,
        categories: {}
      };
    }
  }

  /**
   * 掩码敏感信息
   */
  public maskSensitiveValue(key: string, value: string): string {
    const sensitiveKeys = [
      'SECRET', 'KEY', 'PASSWORD', 'TOKEN', 'ACCESS_KEY', 'SECRET_KEY'
    ];
    
    const isSensitive = sensitiveKeys.some(sensitiveKey => 
      key.toUpperCase().includes(sensitiveKey)
    );
    
    if (isSensitive && value.length > 8) {
      return `${value.substring(0, 4)}****${value.substring(value.length - 4)}`;
    }
    
    return value;
  }
}

// 导出单例实例
export const envConfigService = EnvConfigService.getInstance(); 