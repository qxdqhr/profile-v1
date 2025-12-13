/**
 * 通用文件服务 - 统计API
 * 提供文件统计信息
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponseHelper, ApiErrorFactory, ValidationHelper } from '@/services/universalFile/utils/apiError';
import { FileDbService } from '@/services/universalFile/db/services/fileDbService';
import { db } from '@/db';

// 强制动态渲染,避免构建时静态生成超时
export const dynamic = 'force-dynamic';
export const revalidate = false;
export const fetchCache = 'force-no-store';

// 初始化服务
const fileDbService = new FileDbService(db);

/**
 * GET /api/universal-file/stats
 * 获取文件统计信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId') || undefined;

    // 参数验证
    if (moduleId) {
      ValidationHelper.stringLength(moduleId, 'moduleId', 1, 50);
    }

    // 获取基础统计信息
    const basicStats = await fileDbService.getFileStats(moduleId);

    // 构造响应数据
    const responseData = {
      totalFiles: basicStats.totalFiles,
      totalSize: basicStats.totalSize,
      // 计算平均文件大小
      averageSize: basicStats.totalFiles > 0 ? Math.round(basicStats.totalSize / basicStats.totalFiles) : 0,
      // 格式化文件大小显示
      totalSizeFormatted: formatFileSize(basicStats.totalSize),
      averageSizeFormatted: basicStats.totalFiles > 0 
        ? formatFileSize(Math.round(basicStats.totalSize / basicStats.totalFiles))
        : '0 B',
      // 统计时间
      statsTime: new Date().toISOString(),
      // 过滤条件
      filters: {
        moduleId: moduleId || null
      }
    };

    return ApiResponseHelper.toNextResponse(
      ApiResponseHelper.success(responseData)
    );
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof Error && 'toNextResponse' in error) {
      return (error as any).toNextResponse();
    }
    const apiError = ApiErrorFactory.validationError('request', error, 'API调用失败');
    return apiError.toNextResponse();
  }
}

/**
 * 格式化文件大小显示
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
} 