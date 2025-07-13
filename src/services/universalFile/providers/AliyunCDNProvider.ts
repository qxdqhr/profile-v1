/**
 * 阿里云CDN提供者实现
 */

import { createHash } from 'crypto';
import type {
  ICDNProvider,
  CDNConfig,
  AliyunCDNConfig,
  CDNResult,
  CDNType
} from '../types';

import { CDNProviderError } from '../types';

// 定义阿里云CDN SDK类型 (简化版本)
interface AliyunCDNClient {
  refreshObjectCaches(params: any): Promise<any>;
  pushObjectCache(params: any): Promise<any>;
  describeRefreshTasks(params: any): Promise<any>;
  describePushTasks(params: any): Promise<any>;
  describeDomainConfigs(params: any): Promise<any>;
  describeCdnDomainLogs(params: any): Promise<any>;
  describeDomainRealTimeData(params: any): Promise<any>;
}

/**
 * 阿里云CDN提供者
 */
export class AliyunCDNProvider implements ICDNProvider {
  readonly type: CDNType = 'aliyun-cdn';
  
  private config: AliyunCDNConfig | null = null;
  private client: AliyunCDNClient | null = null;
  private isInitialized = false;

  /**
   * 初始化CDN提供者
   */
  async initialize(config: CDNConfig): Promise<void> {
    if (config.type !== 'aliyun-cdn') {
      throw new CDNProviderError('配置类型不匹配：期望 aliyun-cdn');
    }

    this.config = config as AliyunCDNConfig;
    
    console.log(`🌐 [AliyunCDNProvider] 初始化阿里云CDN，域名: ${this.config.domain}`);

    try {
      // 验证必需的配置项
      this.validateConfig();

      // 注意：这里需要安装阿里云CDN SDK
      // npm install @alicloud/cdn20180510
      try {
        const CDN = require('@alicloud/cdn20180510');
        const OpenApi = require('@alicloud/openapi-client');
        
        const cdnConfig = new OpenApi.Config({
          accessKeyId: this.config.accessKeyId,
          accessKeySecret: this.config.accessKeySecret,
          endpoint: 'cdn.aliyuncs.com'
        });
        
        this.client = new CDN.default(cdnConfig);
        
      } catch (sdkError) {
        console.warn('⚠️ [AliyunCDNProvider] 阿里云CDN SDK未安装，使用模拟模式');
        // 创建模拟客户端用于开发测试
        this.client = this.createMockClient();
      }

      // 测试连接
      await this.testConnection();
      
      this.isInitialized = true;
      console.log('✅ [AliyunCDNProvider] 阿里云CDN初始化完成');
      
    } catch (error) {
      console.error('❌ [AliyunCDNProvider] 阿里云CDN初始化失败:', error);
      throw new CDNProviderError(
        `阿里云CDN初始化失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 生成CDN URL
   */
  async generateUrl(originalUrl: string): Promise<string> {
    this.ensureInitialized();
    
    console.log(`🔗 [AliyunCDNProvider] 生成CDN URL: ${originalUrl}`);

    try {
      // 解析原始URL
      const url = new URL(originalUrl);
      
      // 替换域名为CDN域名
      const cdnUrl = `${url.protocol}//${this.config!.domain}${url.pathname}${url.search}${url.hash}`;
      
      console.log(`✅ [AliyunCDNProvider] CDN URL生成完成: ${cdnUrl}`);
      
      return cdnUrl;

    } catch (error) {
      console.error(`❌ [AliyunCDNProvider] CDN URL生成失败: ${originalUrl}:`, error);
      throw new CDNProviderError(
        `CDN URL生成失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 刷新缓存
   */
  async refreshCache(urls: string[]): Promise<CDNResult> {
    this.ensureInitialized();
    
    console.log(`🔄 [AliyunCDNProvider] 开始刷新CDN缓存，URL数量: ${urls.length}`);

    try {
      // 将URL转换为CDN URL
      const cdnUrls = await Promise.all(urls.map(url => this.generateUrl(url)));
      
      // 调用阿里云CDN API刷新缓存
      const result = await this.client!.refreshObjectCaches({
        domainName: this.config!.domain,
        objectPath: cdnUrls.join('\n'),
        objectType: 'File' // File 或 Directory
      });
      
      console.log(`✅ [AliyunCDNProvider] CDN缓存刷新完成，任务ID: ${result.RefreshTaskId || 'unknown'}`);
      
      return {
        success: true,
        data: {
          taskId: result.RefreshTaskId,
          requestId: result.RequestId,
          urls: cdnUrls
        }
      };

    } catch (error) {
      console.error(`❌ [AliyunCDNProvider] CDN缓存刷新失败:`, error);
      
      return {
        success: false,
        error: `CDN缓存刷新失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 预热缓存
   */
  async preheatCache(urls: string[]): Promise<CDNResult> {
    this.ensureInitialized();
    
    console.log(`🔥 [AliyunCDNProvider] 开始预热CDN缓存，URL数量: ${urls.length}`);

    try {
      // 将URL转换为CDN URL
      const cdnUrls = await Promise.all(urls.map(url => this.generateUrl(url)));
      
      // 调用阿里云CDN API预热缓存
      const result = await this.client!.pushObjectCache({
        domainName: this.config!.domain,
        objectPath: cdnUrls.join('\n'),
        area: 'domestic' // domestic, overseas, global
      });
      
      console.log(`✅ [AliyunCDNProvider] CDN缓存预热完成，任务ID: ${result.PushTaskId || 'unknown'}`);
      
      return {
        success: true,
        data: {
          taskId: result.PushTaskId,
          requestId: result.RequestId,
          urls: cdnUrls
        }
      };

    } catch (error) {
      console.error(`❌ [AliyunCDNProvider] CDN缓存预热失败:`, error);
      
      return {
        success: false,
        error: `CDN缓存预热失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 获取访问统计
   */
  async getAccessStats(startTime: Date, endTime: Date): Promise<CDNResult> {
    this.ensureInitialized();
    
    console.log(`📊 [AliyunCDNProvider] 获取CDN访问统计: ${startTime.toISOString()} - ${endTime.toISOString()}`);

    try {
      // 格式化时间
      const formatTime = (date: Date) => date.toISOString().slice(0, 19).replace('T', ' ') + 'Z';
      
      // 调用阿里云CDN API获取实时数据
      const result = await this.client!.describeDomainRealTimeData({
        domainName: this.config!.domain,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        field: 'bps,qps' // 带宽和QPS
      });
      
      console.log(`✅ [AliyunCDNProvider] CDN访问统计获取完成`);
      
      return {
        success: true,
        data: {
          requestId: result.RequestId,
          dataInterval: result.DataInterval,
          realTimeData: result.RealTimeData,
          domain: this.config!.domain,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        }
      };

    } catch (error) {
      console.error(`❌ [AliyunCDNProvider] CDN访问统计获取失败:`, error);
      
      return {
        success: false,
        error: `CDN访问统计获取失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // ============= 高级功能 =============

  /**
   * 生成防盗链签名URL
   */
  async generateSignedUrl(
    originalUrl: string, 
    expiresIn: number = 3600,
    authKey?: string
  ): Promise<string> {
    this.ensureInitialized();
    
    console.log(`🔐 [AliyunCDNProvider] 生成防盗链签名URL: ${originalUrl}`);

    try {
      const cdnUrl = await this.generateUrl(originalUrl);
      
      // 如果没有提供authKey，直接返回CDN URL
      if (!authKey) {
        console.log(`⚠️ [AliyunCDNProvider] 未提供authKey，返回普通CDN URL`);
        return cdnUrl;
      }

      // 生成防盗链签名
      const parsedUrl = new URL(cdnUrl);
      const timestamp = Math.floor(Date.now() / 1000) + expiresIn;
      
      // 阿里云CDN防盗链签名算法
      // signString = "path-timestamp-rand-uid-authKey"
      const signString = `${parsedUrl.pathname}-${timestamp}-0-0-${authKey}`;
      const authValue = createHash('md5').update(signString).digest('hex');
      
      // 构建签名URL
      const signedUrl = `${cdnUrl}?auth_key=${timestamp}-0-0-${authValue}`;
      
      console.log(`✅ [AliyunCDNProvider] 防盗链签名URL生成完成`);
      
      return signedUrl;

    } catch (error) {
      console.error(`❌ [AliyunCDNProvider] 防盗链签名URL生成失败: ${originalUrl}:`, error);
      throw new CDNProviderError(
        `防盗链签名URL生成失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 查询刷新任务状态
   */
  async getRefreshTaskStatus(taskId: string): Promise<CDNResult> {
    this.ensureInitialized();
    
    try {
      const result = await this.client!.describeRefreshTasks({
        taskId
      });
      
      return {
        success: true,
        data: {
          tasks: result.Tasks,
          requestId: result.RequestId
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `查询刷新任务状态失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 查询预热任务状态
   */
  async getPreheatTaskStatus(taskId: string): Promise<CDNResult> {
    this.ensureInitialized();
    
    try {
      const result = await this.client!.describePushTasks({
        taskId
      });
      
      return {
        success: true,
        data: {
          tasks: result.Tasks,
          requestId: result.RequestId
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `查询预热任务状态失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 获取域名配置
   */
  async getDomainConfig(): Promise<CDNResult> {
    this.ensureInitialized();
    
    try {
      const result = await this.client!.describeDomainConfigs({
        domainName: this.config!.domain
      });
      
      return {
        success: true,
        data: {
          domainConfigs: result.DomainConfigs,
          requestId: result.RequestId
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `获取域名配置失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 优化URL (添加图像处理参数等)
   */
  async optimizeUrl(
    originalUrl: string,
    options: {
      imageQuality?: number;
      imageFormat?: 'webp' | 'jpg' | 'png';
      imageResize?: { width?: number; height?: number };
      enableGzip?: boolean;
    } = {}
  ): Promise<string> {
    this.ensureInitialized();
    
    try {
      const cdnUrl = await this.generateUrl(originalUrl);
      const url = new URL(cdnUrl);
      
      // 添加阿里云CDN图像处理参数
      const params = new URLSearchParams(url.search);
      
      if (options.imageQuality) {
        params.set('x-oss-process', `image/quality,q_${options.imageQuality}`);
      }
      
      if (options.imageFormat) {
        const formatParam = params.get('x-oss-process') || 'image';
        params.set('x-oss-process', `${formatParam}/format,${options.imageFormat}`);
      }
      
      if (options.imageResize) {
        const resizeParam = params.get('x-oss-process') || 'image';
        let resize = 'resize';
        if (options.imageResize.width) resize += `,w_${options.imageResize.width}`;
        if (options.imageResize.height) resize += `,h_${options.imageResize.height}`;
        params.set('x-oss-process', `${resizeParam}/${resize}`);
      }
      
      url.search = params.toString();
      
      return url.toString();

    } catch (error) {
      console.error(`❌ [AliyunCDNProvider] URL优化失败: ${originalUrl}:`, error);
      // 如果优化失败，返回原始CDN URL
      return this.generateUrl(originalUrl);
    }
  }

  // ============= 私有方法 =============

  /**
   * 确保已初始化
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.client || !this.config) {
      throw new CDNProviderError('CDN提供者未初始化');
    }
  }

  /**
   * 验证配置
   */
  private validateConfig(): void {
    if (!this.config) {
      throw new CDNProviderError('CDN配置为空');
    }

    const required = ['domain', 'accessKeyId', 'accessKeySecret'];
    const missing = required.filter(key => !this.config![key as keyof AliyunCDNConfig]);
    
    if (missing.length > 0) {
      throw new CDNProviderError(`CDN配置缺少必需项: ${missing.join(', ')}`);
    }

    // 验证域名格式
    if (!this.isValidDomain(this.config.domain)) {
      throw new CDNProviderError(`无效的CDN域名: ${this.config.domain}`);
    }
  }

  /**
   * 验证域名格式
   */
  private isValidDomain(domain: string): boolean {
    // 简单的域名格式验证
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  }

  /**
   * 测试连接
   */
  private async testConnection(): Promise<void> {
    try {
      // 尝试获取域名配置来测试连接
      await this.getDomainConfig();
      console.log(`✅ [AliyunCDNProvider] CDN连接测试成功`);
    } catch (error) {
      console.warn(`⚠️ [AliyunCDNProvider] CDN连接测试失败，可能是权限问题:`, error);
      // 不抛出错误，因为可能是权限限制
    }
  }

  /**
   * 创建模拟客户端（用于开发测试）
   */
  private createMockClient(): AliyunCDNClient {
    console.log('🧪 [AliyunCDNProvider] 创建模拟CDN客户端');
    
    return {
      async refreshObjectCaches(params: any) {
        console.log('🔄 [MockCDN] 模拟刷新缓存:', params);
        return {
          RefreshTaskId: `mock-refresh-${Date.now()}`,
          RequestId: `mock-request-${Date.now()}`
        };
      },
      
      async pushObjectCache(params: any) {
        console.log('🔥 [MockCDN] 模拟预热缓存:', params);
        return {
          PushTaskId: `mock-push-${Date.now()}`,
          RequestId: `mock-request-${Date.now()}`
        };
      },
      
      async describeRefreshTasks(params: any) {
        console.log('📋 [MockCDN] 模拟查询刷新任务:', params);
        return {
          Tasks: {
            Task: [{
              TaskId: params.taskId,
              Status: 'Complete',
              Process: '100%',
              CreateTime: new Date().toISOString()
            }]
          },
          RequestId: `mock-request-${Date.now()}`
        };
      },
      
      async describePushTasks(params: any) {
        console.log('📋 [MockCDN] 模拟查询预热任务:', params);
        return {
          Tasks: {
            Task: [{
              TaskId: params.taskId,
              Status: 'Complete',
              Process: '100%',
              CreateTime: new Date().toISOString()
            }]
          },
          RequestId: `mock-request-${Date.now()}`
        };
      },
      
      async describeDomainConfigs(params: any) {
        console.log('⚙️ [MockCDN] 模拟获取域名配置:', params);
        return {
          DomainConfigs: {
            DomainConfig: [{
              FunctionName: 'cache',
              ConfigId: 'mock-config-id',
              Status: 'success'
            }]
          },
          RequestId: `mock-request-${Date.now()}`
        };
      },
      
      async describeCdnDomainLogs(params: any) {
        console.log('📊 [MockCDN] 模拟获取日志:', params);
        return {
          DomainLogDetails: {
            DomainLogDetail: []
          },
          RequestId: `mock-request-${Date.now()}`
        };
      },
      
      async describeDomainRealTimeData(params: any) {
        console.log('📈 [MockCDN] 模拟获取实时数据:', params);
        return {
          RealTimeData: {
            UsageData: [{
              TimeStamp: new Date().toISOString(),
              Value: Math.random() * 1000
            }]
          },
          DataInterval: '60',
          RequestId: `mock-request-${Date.now()}`
        };
      }
    };
  }

  /**
   * 获取随机域名（支持多域名负载均衡）
   * 注意：当前配置只支持单个域名，此方法为将来扩展准备
   */
  private getRandomDomain(): string {
    // 当前只有一个域名
    return this.config!.domain;
  }

  /**
   * 批量刷新缓存（带进度回调）
   */
  async batchRefreshCache(
    urls: string[],
    batchSize: number = 20,
    onProgress?: (completed: number, total: number) => void
  ): Promise<CDNResult> {
    this.ensureInitialized();
    
    console.log(`🔄 [AliyunCDNProvider] 开始批量刷新缓存，总URL数: ${urls.length}，批次大小: ${batchSize}`);

    try {
      const results = [];
      let completed = 0;
      
      // 分批处理
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const batchResult = await this.refreshCache(batch);
        results.push(batchResult);
        
        completed += batch.length;
        if (onProgress) {
          onProgress(completed, urls.length);
        }
        
        // 避免API限流，每批次间隔1秒
        if (i + batchSize < urls.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      console.log(`✅ [AliyunCDNProvider] 批量刷新完成，成功: ${successCount}/${results.length}`);
      
      return {
        success: successCount === results.length,
        data: {
          totalBatches: results.length,
          successBatches: successCount,
          results
        }
      };

    } catch (error) {
      console.error(`❌ [AliyunCDNProvider] 批量刷新失败:`, error);
      
      return {
        success: false,
        error: `批量刷新失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }
} 