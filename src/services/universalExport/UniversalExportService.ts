/**
 * 通用CSV导出服务
 * 
 * 提供统一的CSV导出功能，支持配置化字段选择和格式化
 */

import type {
  ExportConfig,
  ExportRequest,
  ExportResult,
  ExportProgress,
  ExportError,
  ExportField,
  ExportFormat,
  UniversalExportServiceConfig,
  ExportEvent,
  ExportEventListener,
  FieldMapper,
  DataTransformer,
  Validator,
  Formatter
} from './types';

// 客户端服务
import { universalExportClient } from './client';

import {
  ExportServiceError,
  ExportConfigError,
  ExportDataError,
  ExportFileError
} from './types';

// ============= 默认配置 =============

const DEFAULT_CONFIG: UniversalExportServiceConfig = {
  defaultFormat: 'csv',
  defaultDelimiter: ',',
  defaultEncoding: 'utf-8',
  defaultAddBOM: true,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxRowsLimit: 100000,
  maxConcurrentExports: 5,
  exportTimeout: 300000, // 5分钟
  cache: {
    configTTL: 3600, // 1小时
    resultTTL: 1800, // 30分钟
  },
};

// ============= 内置格式化器 =============

const DEFAULT_FORMATTERS: Record<string, Formatter> = {
  // 日期格式化
  date: (value: any) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toISOString().split('T')[0];
  },
  
  // 时间格式化
  datetime: (value: any) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleString('zh-CN');
  },
  
  // 数字格式化
  number: (value: any) => {
    if (value === null || value === undefined) return '';
    return String(value);
  },
  
  // 货币格式化
  currency: (value: any) => {
    if (value === null || value === undefined) return '';
    return `¥${Number(value).toFixed(2)}`;
  },
  
  // 百分比格式化
  percentage: (value: any) => {
    if (value === null || value === undefined) return '';
    return `${(Number(value) * 100).toFixed(2)}%`;
  },
  
  // 布尔值格式化
  boolean: (value: any) => {
    if (value === null || value === undefined) return '';
    return value ? '是' : '否';
  },
  
  // 数组格式化
  array: (value: any) => {
    if (!Array.isArray(value)) return '';
    return value.join(', ');
  },
  
  // 对象格式化
  object: (value: any) => {
    if (!value || typeof value !== 'object') return '';
    return JSON.stringify(value);
  },
};

// ============= 主服务类 =============

export class UniversalExportService {
  private config: UniversalExportServiceConfig;
  private eventListeners: Map<string, ExportEventListener[]> = new Map();
  private activeExports: Map<string, ExportProgress> = new Map();
  private configCache: Map<string, { config: ExportConfig; timestamp: number }> = new Map();
  private resultCache: Map<string, { result: ExportResult; timestamp: number }> = new Map();

  constructor(config?: Partial<UniversalExportServiceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============= 配置管理 =============

  /**
   * 创建导出配置
   */
  async createConfig(config: Omit<ExportConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExportConfig> {
    try {
      // 验证配置
      this.validateConfig({
        ...config,
        id: 'temp',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 通过客户端API保存到数据库
      const newConfig = await universalExportClient.createConfig(config);

      // 保存到缓存
      this.configCache.set(newConfig.id, {
        config: newConfig,
        timestamp: Date.now(),
      });

      // 触发事件
      this.emitEvent({
        type: 'config:save',
        exportId: newConfig.id,
        timestamp: new Date(),
        data: { config: newConfig },
      });

      return newConfig;
    } catch (error) {
      throw new ExportConfigError(
        `创建导出配置失败: ${error instanceof Error ? error.message : '未知错误'}`,
        { originalError: error }
      );
    }
  }

  /**
   * 获取导出配置
   */
  async getConfig(configId: string): Promise<ExportConfig | null> {
    // 先从缓存获取
    const cached = this.configCache.get(configId);
    if (cached && Date.now() - cached.timestamp < this.config.cache.configTTL * 1000) {
      return cached.config;
    }

    // 从缓存中获取（暂时不支持从数据库获取单个配置）
    return null;
  }

  /**
   * 更新导出配置
   */
  async updateConfig(configId: string, updates: Partial<ExportConfig>): Promise<ExportConfig> {
    const existing = await this.getConfig(configId);
    if (!existing) {
      throw new ExportConfigError(`配置不存在: ${configId}`);
    }

    const updatedConfig: ExportConfig = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    // 验证配置
    this.validateConfig(updatedConfig);

    // 更新缓存
    this.configCache.set(configId, {
      config: updatedConfig,
      timestamp: Date.now(),
    });

    // 触发事件
    this.emitEvent({
      type: 'config:save',
      exportId: configId,
      timestamp: new Date(),
      data: { config: updatedConfig },
    });

    return updatedConfig;
  }

  /**
   * 删除导出配置
   */
  async deleteConfig(configId: string): Promise<void> {
    const existing = await this.getConfig(configId);
    if (!existing) {
      throw new ExportConfigError(`配置不存在: ${configId}`);
    }

    // 从缓存删除
    this.configCache.delete(configId);

    // 触发事件
    this.emitEvent({
      type: 'config:delete',
      exportId: configId,
      timestamp: new Date(),
      data: { configId },
    });
  }

  /**
   * 获取模块的配置列表
   */
  async getConfigsByModule(moduleId: string, businessId?: string): Promise<ExportConfig[]> {
    return await universalExportClient.getConfigsByModule(moduleId, businessId);
  }

  // ============= 导出执行 =============

  /**
   * 执行导出
   */
  async export(request: ExportRequest): Promise<ExportResult> {
    const exportId = this.generateId();
    const startTime = new Date();

    try {
      // 获取配置 - 支持直接传入配置对象或从缓存获取
      let config: ExportConfig;
      if (typeof request.configId === 'object' && request.configId !== null) {
        // 直接传入配置对象
        config = request.configId as ExportConfig;
      } else {
        // 从缓存获取配置
        const cachedConfig = await this.getConfig(request.configId as string);
        if (!cachedConfig) {
          throw new ExportConfigError(`导出配置不存在: ${request.configId}`);
        }
        config = cachedConfig;
      }

      // 创建进度对象
      const progress: ExportProgress = {
        exportId,
        status: 'pending',
        progress: 0,
        processedRows: 0,
        totalRows: 0,
        startTime,
      };

      this.activeExports.set(exportId, progress);

      // 触发开始事件
      this.emitEvent({
        type: 'export:start',
        exportId,
        timestamp: startTime,
        data: { config, request },
      });

      // 获取数据
      const data = await this.getData(request);
      progress.totalRows = data.length;
      progress.status = 'processing';

      // 过滤和排序数据
      const processedData = await this.processData(data, request, config);

      // 生成文件
      const result = await this.generateFile(processedData, config, request, exportId);

      // 更新进度
      progress.status = 'completed';
      progress.progress = 100;
      progress.processedRows = data.length;

      // 触发完成事件
      this.emitEvent({
        type: 'export:complete',
        exportId,
        timestamp: new Date(),
        data: { result },
      });

      // 缓存结果
      this.resultCache.set(exportId, {
        result,
        timestamp: Date.now(),
      });

      // 清理进度
      this.activeExports.delete(exportId);

      return result;

    } catch (error) {
      const errorObj: ExportError = {
        code: 'EXPORT_FAILED',
        message: error instanceof Error ? error.message : '导出失败',
        details: { originalError: error },
        timestamp: new Date(),
      };

      // 更新进度
      const progress = this.activeExports.get(exportId);
      if (progress) {
        progress.status = 'failed';
        progress.error = errorObj.message;
        this.activeExports.delete(exportId);
      }

      // 触发错误事件
      this.emitEvent({
        type: 'export:error',
        exportId,
        timestamp: new Date(),
        error: errorObj.message,
        data: { error: errorObj },
      });

      throw error;
    }
  }

  /**
   * 获取导出进度
   */
  getExportProgress(exportId: string): ExportProgress | null {
    return this.activeExports.get(exportId) || null;
  }

  /**
   * 取消导出
   */
  cancelExport(exportId: string): boolean {
    const progress = this.activeExports.get(exportId);
    if (!progress) {
      return false;
    }

    progress.status = 'cancelled';
    this.activeExports.delete(exportId);

    // 触发取消事件
    this.emitEvent({
      type: 'export:cancel',
      exportId,
      timestamp: new Date(),
      data: { progress },
    });

    return true;
  }

  // ============= 事件管理 =============

  /**
   * 添加事件监听器
   */
  addEventListener(type: string, listener: ExportEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(type: string, listener: ExportEventListener): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // ============= 私有方法 =============

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 验证配置
   */
  private validateConfig(config: ExportConfig): void {
    if (!config.name || config.name.trim() === '') {
      throw new ExportConfigError('配置名称不能为空');
    }

    if (!config.fields || config.fields.length === 0) {
      throw new ExportConfigError('至少需要定义一个字段');
    }

    const enabledFields = config.fields.filter(f => f.enabled);
    if (enabledFields.length === 0) {
      throw new ExportConfigError('至少需要启用一个字段');
    }

    // 检查字段键名唯一性
    const keys = config.fields.map(f => f.key);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      throw new ExportConfigError('字段键名必须唯一');
    }
  }

  /**
   * 获取数据
   */
  private async getData(request: ExportRequest): Promise<any[]> {
    try {
      if (typeof request.dataSource === 'function') {
        return await request.dataSource();
      } else {
        // 这里可以扩展支持从API获取数据
        throw new ExportDataError('暂不支持字符串数据源');
      }
    } catch (error) {
      throw new ExportDataError(
        `获取数据失败: ${error instanceof Error ? error.message : '未知错误'}`,
        { originalError: error }
      );
    }
  }

  /**
   * 处理数据
   */
  private async processData(
    data: any[],
    request: ExportRequest,
    config: ExportConfig
  ): Promise<any[]> {
    let processedData = [...data];

    // 应用过滤器
    if (request.filters && request.filters.length > 0) {
      processedData = this.applyFilters(processedData, request.filters);
    }

    // 应用排序
    if (request.sortBy && request.sortBy.length > 0) {
      processedData = this.applySorting(processedData, request.sortBy);
    }

    // 应用分页
    if (request.pagination) {
      const { page, pageSize } = request.pagination;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      processedData = processedData.slice(start, end);
    }

    // 限制行数
    if (config.maxRows && processedData.length > config.maxRows) {
      processedData = processedData.slice(0, config.maxRows);
    }

    return processedData;
  }

  /**
   * 应用过滤器
   */
  private applyFilters(data: any[], filters: any[]): any[] {
    return data.filter(item => {
      return filters.every(filter => {
        const value = this.getNestedValue(item, filter.field);
        
        switch (filter.operator) {
          case 'eq':
            return value === filter.value;
          case 'ne':
            return value !== filter.value;
          case 'gt':
            return value > filter.value;
          case 'gte':
            return value >= filter.value;
          case 'lt':
            return value < filter.value;
          case 'lte':
            return value <= filter.value;
          case 'contains':
            return String(value).includes(String(filter.value));
          case 'startsWith':
            return String(value).startsWith(String(filter.value));
          case 'endsWith':
            return String(value).endsWith(String(filter.value));
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          case 'notIn':
            return Array.isArray(filter.value) && !filter.value.includes(value);
          default:
            return true;
        }
      });
    });
  }

  /**
   * 应用排序
   */
  private applySorting(data: any[], sortBy: any[]): any[] {
    return data.sort((a, b) => {
      for (const sort of sortBy) {
        const aValue = this.getNestedValue(a, sort.field);
        const bValue = this.getNestedValue(b, sort.field);
        
        if (aValue < bValue) {
          return sort.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sort.direction === 'asc' ? 1 : -1;
        }
      }
      return 0;
    });
  }

  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * 生成文件
   */
  private async generateFile(
    data: any[],
    config: ExportConfig,
    request: ExportRequest,
    exportId: string
  ): Promise<ExportResult> {
    const startTime = new Date();
    const enabledFields = config.fields.filter(f => f.enabled);

    try {
      let content: string;
      let fileName: string;

      switch (config.format) {
        case 'csv':
          content = this.generateCSV(data, enabledFields, config);
          fileName = this.generateFileName(request.customFileName || config.fileNameTemplate, 'csv');
          break;
        case 'json':
          content = this.generateJSON(data, enabledFields);
          fileName = this.generateFileName(request.customFileName || config.fileNameTemplate, 'json');
          break;
        default:
          throw new ExportFileError(`不支持的导出格式: ${config.format}`);
      }

      // 创建Blob
      const blob = new Blob([content], { type: this.getMimeType(config.format) });
      
      // 检查文件大小
      if (blob.size > this.config.maxFileSize) {
        throw new ExportFileError(`文件大小超过限制: ${blob.size} > ${this.config.maxFileSize}`);
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        exportId,
        fileName,
        fileSize: blob.size,
        fileBlob: blob,
        exportedRows: data.length,
        startTime,
        endTime,
        duration,
        statistics: {
          totalRows: data.length,
          filteredRows: data.length,
          exportedRows: data.length,
          skippedRows: 0,
        },
      };

    } catch (error) {
      throw new ExportFileError(
        `生成文件失败: ${error instanceof Error ? error.message : '未知错误'}`,
        { originalError: error }
      );
    }
  }

  /**
   * 生成CSV内容
   */
  private generateCSV(data: any[], fields: ExportField[], config: ExportConfig): string {
    const lines: string[] = [];

    // 添加BOM
    if (config.addBOM) {
      lines.push('\uFEFF');
    }

    // 添加表头
    if (config.includeHeader) {
      const headers = fields.map(f => this.escapeCSVField(f.label));
      lines.push(headers.join(config.delimiter));
    }

    // 添加数据行
    for (const item of data) {
      const row = fields.map(field => {
        let value = this.getNestedValue(item, field.key);
        
        // 应用格式化器
        if (field.formatter) {
          value = field.formatter(value);
        } else if (DEFAULT_FORMATTERS[field.type]) {
          value = DEFAULT_FORMATTERS[field.type](value);
        } else {
          value = String(value || '');
        }
        
        return this.escapeCSVField(value);
      });
      
      lines.push(row.join(config.delimiter));
    }

    return lines.join('\n');
  }

  /**
   * 生成JSON内容
   */
  private generateJSON(data: any[], fields: ExportField[]): string {
    const processedData = data.map(item => {
      const processed: Record<string, any> = {};
      
      for (const field of fields) {
        let value = this.getNestedValue(item, field.key);
        
        // 应用格式化器
        if (field.formatter) {
          value = field.formatter(value);
        } else if (DEFAULT_FORMATTERS[field.type]) {
          value = DEFAULT_FORMATTERS[field.type](value);
        }
        
        processed[field.key] = value;
      }
      
      return processed;
    });

    return JSON.stringify(processedData, null, 2);
  }

  /**
   * 转义CSV字段
   */
  private escapeCSVField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * 生成文件名
   */
  private generateFileName(template: string, extension: string): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    return template
      .replace('{date}', dateStr)
      .replace('{time}', timeStr)
      .replace('{timestamp}', now.getTime().toString())
      + `.${extension}`;
  }

  /**
   * 获取MIME类型
   */
  private getMimeType(format: ExportFormat): string {
    switch (format) {
      case 'csv':
        return 'text/csv; charset=utf-8';
      case 'json':
        return 'application/json; charset=utf-8';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * 触发事件
   */
  private emitEvent(event: ExportEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('事件监听器执行失败:', error);
        }
      });
    }
  }
} 