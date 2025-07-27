/**
 * 通用导出服务客户端API
 */

import type { ExportConfig } from './types';

/**
 * 客户端导出配置服务
 */
export class UniversalExportClientService {
  /**
   * 获取模块的配置列表
   */
  async getConfigsByModule(moduleId: string, businessId?: string): Promise<ExportConfig[]> {
    const params = new URLSearchParams({ moduleId });
    if (businessId) {
      params.append('businessId', businessId);
    }

    const response = await fetch(`/api/universal-export/configs?${params}`);
    
    if (!response.ok) {
      throw new Error(`获取配置失败: ${response.statusText}`);
    }

    const data = await response.json();
    return data.configs.map((dbConfig: any) => ({
      id: dbConfig.id,
      name: dbConfig.name,
      description: dbConfig.description || undefined,
      format: dbConfig.format,
      fields: dbConfig.fields,
      fileNameTemplate: dbConfig.fileNameTemplate,
      includeHeader: dbConfig.includeHeader,
      delimiter: dbConfig.delimiter,
      encoding: dbConfig.encoding,
      addBOM: dbConfig.addBOM,
      maxRows: dbConfig.maxRows || undefined,
      createdAt: new Date(dbConfig.createdAt),
      updatedAt: new Date(dbConfig.updatedAt),
      moduleId: dbConfig.moduleId,
      businessId: dbConfig.businessId || undefined,
      createdBy: dbConfig.createdBy || undefined,
    }));
  }

  /**
   * 创建新的配置
   */
  async createConfig(config: Omit<ExportConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExportConfig> {
    const response = await fetch('/api/universal-export/configs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: config.name,
        description: config.description,
        format: config.format,
        fields: config.fields,
        fileNameTemplate: config.fileNameTemplate,
        includeHeader: config.includeHeader,
        delimiter: config.delimiter,
        encoding: config.encoding,
        addBOM: config.addBOM,
        maxRows: config.maxRows,
        moduleId: config.moduleId,
        businessId: config.businessId,
        createdBy: config.createdBy,
      }),
    });

    if (!response.ok) {
      throw new Error(`创建配置失败: ${response.statusText}`);
    }

    const data = await response.json();
    const dbConfig = data.config;

    return {
      id: dbConfig.id,
      name: dbConfig.name,
      description: dbConfig.description || undefined,
      format: dbConfig.format,
      fields: dbConfig.fields,
      fileNameTemplate: dbConfig.fileNameTemplate,
      includeHeader: dbConfig.includeHeader,
      delimiter: dbConfig.delimiter,
      encoding: dbConfig.encoding,
      addBOM: dbConfig.addBOM,
      maxRows: dbConfig.maxRows || undefined,
      createdAt: new Date(dbConfig.createdAt),
      updatedAt: new Date(dbConfig.updatedAt),
      moduleId: dbConfig.moduleId,
      businessId: dbConfig.businessId || undefined,
      createdBy: dbConfig.createdBy || undefined,
    };
  }
}

// 导出客户端服务实例
export const universalExportClient = new UniversalExportClientService(); 