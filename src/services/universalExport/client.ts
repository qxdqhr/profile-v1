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

  /**
   * 执行数据导出（自定义实现，支持文件blob处理）
   */
  async exportData(request: Omit<ExportRequest, 'callbacks'> & {
    dataSource: any[] | string;
  }): Promise<any> {
    const url = '/api/universal-export/export';
    try {
      const isDataArray = Array.isArray(request.dataSource);
      const requestBody = {
        configId: request.configId,
        queryParams: request.queryParams,
        fieldMapping: request.fieldMapping,
        filters: request.filters,
        sortBy: request.sortBy,
        pagination: request.pagination,
        customFileName: request.customFileName
      };

      if (isDataArray) {
        requestBody.data = request.dataSource;
      } else {
        requestBody.dataSource = request.dataSource;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || `导出失败: ${response.statusText}`);
      }

      const data = await response.json();

      // 自定义的转换函数，支持base64文件数据
      return this.transformExportResultFromAPI(data.result);
    } catch (error) {
      throw {
        code: 'EXPORT_DATA_ERROR',
        message: `数据导出失败: ${error instanceof Error ? error.message : '未知错误'}`,
        details: { request, originalError: error },
        timestamp: new Date(),
      };
    }
  }

  /**
   * 自定义的导出结果转换函数，支持base64文件数据
   */
  private transformExportResultFromAPI(apiResult: any) {
    let fileBlob: Blob | undefined = undefined;

    // 如果有base64编码的文件数据，将其转换为Blob
    if (apiResult.fileBlob && typeof apiResult.fileBlob === 'string') {
      try {
        const binaryString = atob(apiResult.fileBlob);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // 根据文件名确定MIME类型
        const getMimeType = (filename: string): string => {
          const extension = filename.split('.').pop()?.toLowerCase();
          switch (extension) {
            case 'csv':
              return 'text/csv; charset=utf-8';
            case 'xlsx':
            case 'xls':
              return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'json':
              return 'application/json; charset=utf-8';
            default:
              return 'application/octet-stream';
          }
        };

        fileBlob = new Blob([bytes], { type: getMimeType(apiResult.fileName) });
      } catch (error) {
        console.error('转换base64文件数据失败:', error);
      }
    }

    return {
      exportId: apiResult.exportId,
      fileName: apiResult.fileName,
      fileSize: apiResult.fileSize,
      fileUrl: apiResult.fileUrl,
      fileBlob: fileBlob,
      exportedRows: apiResult.exportedRows,
      startTime: new Date(apiResult.startTime),
      endTime: new Date(apiResult.endTime),
      duration: apiResult.duration,
      statistics: apiResult.statistics,
    };
  }
}

// 导出客户端服务实例
export const universalExportClient = new UniversalExportClientService(); 