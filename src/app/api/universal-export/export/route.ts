/**
 * 通用导出执行API路由
 *
 * 处理导出数据请求，支持配置化导出
 */

import { NextRequest, NextResponse } from 'next/server';
import { UniversalExportService } from '@/services/universalExport/UniversalExportService';
import type { ExportRequest } from '@/services/universalExport/types';

/**
 * 执行数据导出
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      configId,
      dataSource,
      queryParams,
      fieldMapping,
      filters,
      sortBy,
      pagination,
      customFileName,
      config, // 支持直接传递配置对象
      data // 支持直接传递数据数组
    } = body;

    console.log('📨 [API: universal-export/export] 收到导出请求:', {
      configId: typeof configId === 'object' ? '配置对象' : configId,
      hasDataSource: !!dataSource,
      hasQueryParams: !!queryParams,
      hasFilters: !!filters,
      hasSortBy: !!sortBy,
      hasPagination: !!pagination,
      customFileName,
    });

    // 验证必需参数
    if (!configId) {
      return NextResponse.json(
        { error: '缺少必需的configId参数' },
        { status: 400 }
      );
    }

    // 检查是否有dataSource或直接数据
    if (!dataSource && !data) {
      return NextResponse.json(
        { error: '缺少必需的dataSource或data参数' },
        { status: 400 }
      );
    }

    // 创建导出服务实例
    const exportService = new UniversalExportService();

    // 构建导出请求
    const exportRequest: ExportRequest = {
      configId,
      dataSource: data ? () => Promise.resolve(data) : dataSource, // 如果有直接数据，使用它，否则使用dataSource函数
      queryParams: queryParams || {},
      fieldMapping: fieldMapping || {},
      filters: filters || [],
      sortBy: sortBy || [],
      pagination: pagination || {},
      customFileName,
      callbacks: {
        onProgress: (progress) => {
          console.log('📊 [API: universal-export/export] 导出进度:', {
            exportId: progress.exportId,
            status: progress.status,
            progress: progress.progress,
            processedRows: progress.processedRows,
            totalRows: progress.totalRows,
          });
        },
        onSuccess: (result) => {
          console.log('✅ [API: universal-export/export] 导出成功:', {
            exportId: result.exportId,
            fileName: result.fileName,
            fileSize: result.fileSize,
            exportedRows: result.exportedRows,
            duration: result.duration,
          });
        },
        onError: (error) => {
          console.error('❌ [API: universal-export/export] 导出失败:', error);
        },
      },
    };

    console.log('🚀 [API: universal-export/export] 开始执行导出...');

    // 执行导出
    const result = await exportService.export(exportRequest);

    console.log('✅ [API: universal-export/export] 导出执行完成:', {
      exportId: result.exportId,
      fileName: result.fileName,
      exportedRows: result.exportedRows,
      hasFileBlob: !!result.fileBlob,
      fileBlobSize: result.fileBlob?.size || 0,
    });

    // 如果有文件数据，直接返回文件
    if (result.fileBlob) {
      console.log('📁 [API: universal-export/export] 返回文件数据');

      // 根据文件名确定MIME类型
      const getMimeType = (fileName: string): string => {
        const extension = fileName.split('.').pop()?.toLowerCase();
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

      const headers = new Headers();
      headers.set('Content-Type', getMimeType(result.fileName));
      headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(result.fileName)}"`);
      headers.set('Content-Length', result.fileBlob.size.toString());

      return new NextResponse(result.fileBlob, {
        status: 200,
        headers,
      });
    }

    // 如果没有文件数据，返回结果信息
    console.log('📄 [API: universal-export/export] 返回导出结果信息');

    return NextResponse.json({
      result: {
        exportId: result.exportId,
        fileName: result.fileName,
        fileSize: result.fileSize,
        fileUrl: result.fileUrl,
        exportedRows: result.exportedRows,
        startTime: result.startTime,
        endTime: result.endTime,
        duration: result.duration,
        statistics: result.statistics,
      }
    });

  } catch (error) {
    console.error('❌ [API: universal-export/export] 导出执行失败:', error);

    const errorMessage = error instanceof Error ? error.message : '导出执行失败';

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
