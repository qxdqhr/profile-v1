/**
 * 通用文件服务 - 文件管理API
 * 提供文件的CRUD操作接口
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponseHelper, ApiErrorFactory, ValidationHelper } from '@/services/universalFile/utils/apiError';
import { FileDbService } from '@/services/universalFile/db/services/fileDbService';
import { FileQueryParams, FileUploadParams } from '@/services/universalFile/types/api';
import { db } from '@/db';

// 初始化服务
const fileDbService = new FileDbService(db);

/**
 * GET /api/universal-file/files
 * 查询文件列表
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const queryParams: FileQueryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      orderBy: searchParams.get('orderBy') || 'uploadTime',
      orderDirection: (searchParams.get('orderDirection') as 'asc' | 'desc') || 'desc',
      moduleId: searchParams.get('moduleId') || undefined,
      businessId: searchParams.get('businessId') || undefined,
      folderId: searchParams.get('folderId') || undefined,
      mimeType: searchParams.get('mimeType') || undefined,
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      sizeMin: searchParams.get('sizeMin') ? parseInt(searchParams.get('sizeMin')!) : undefined,
      sizeMax: searchParams.get('sizeMax') ? parseInt(searchParams.get('sizeMax')!) : undefined,
      uploadTimeStart: searchParams.get('uploadTimeStart') || undefined,
      uploadTimeEnd: searchParams.get('uploadTimeEnd') || undefined,
      isDeleted: searchParams.get('isDeleted') === 'true' ? true : undefined,
      isTemporary: searchParams.get('isTemporary') === 'true' ? true : undefined,
      uploaderId: searchParams.get('uploaderId') || undefined,
    };

    // 参数验证
    ValidationHelper.numberRange(queryParams.page!, 'page', 1);
    ValidationHelper.numberRange(queryParams.pageSize!, 'pageSize', 1, 100);

    if (queryParams.sizeMin !== undefined && queryParams.sizeMax !== undefined) {
      if (queryParams.sizeMin > queryParams.sizeMax) {
        throw ApiErrorFactory.validationError('sizeMin', queryParams.sizeMin, '不能大于sizeMax');
      }
    }

    // 查询文件列表
    const result = await fileDbService.getFiles(queryParams);

    // 转换为API响应格式
    const responseData = {
      files: result.files.map(file => ({
        id: file.id,
        originalName: file.originalName,
        storedName: file.storedName,
        extension: file.extension,
        mimeType: file.mimeType,
        size: file.size,
        md5Hash: file.md5Hash,
        sha256Hash: file.sha256Hash,
        storagePath: file.storagePath,
        cdnUrl: file.cdnUrl,
        folderId: file.folderId,
        moduleId: file.moduleId,
        businessId: file.businessId,
        tags: file.tags || [],
        metadata: file.metadata || {},
        isTemporary: file.isTemporary,
        isDeleted: file.isDeleted,
        accessCount: file.accessCount,
        downloadCount: file.downloadCount,
        uploaderId: file.uploaderId,
        uploadTime: file.createdAt,
        lastAccessTime: file.lastAccessTime,
        expiresAt: file.expiresAt,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      })),
      pagination: {
        total: result.total,
        page: queryParams.page!,
        pageSize: queryParams.pageSize!,
        totalPages: Math.ceil(result.total / queryParams.pageSize!),
      }
    };

    return ApiResponseHelper.toNextResponse(
      ApiResponseHelper.success(responseData, {
        total: result.total,
        page: queryParams.page,
        pageSize: queryParams.pageSize,
        totalPages: Math.ceil(result.total / queryParams.pageSize!),
      })
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
 * POST /api/universal-file/files
 * 上传文件
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: 实现文件上传功能
    // 当前返回未实现错误
    return NextResponse.json({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: '文件上传功能尚未实现'
      }
    }, { status: 501 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: '服务器内部错误'
      }
    }, { status: 500 });
  }
}

/**
 * PUT /api/universal-file/files
 * 批量更新文件
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileIds, updateData } = body;

    // 参数验证
    ValidationHelper.required(fileIds, 'fileIds');
    ValidationHelper.arrayLength(fileIds, 'fileIds', 1, 100);
    
    fileIds.forEach((fileId: string, index: number) => {
      ValidationHelper.uuid(fileId, `fileIds[${index}]`);
    });

    if (updateData.originalName) {
      ValidationHelper.stringLength(updateData.originalName, 'originalName', 1, 255);
    }

    if (updateData.folderId) {
      ValidationHelper.uuid(updateData.folderId, 'folderId');
    }

    // 批量更新文件
    const results = [];
    for (const fileId of fileIds) {
      try {
        const file = await fileDbService.getFileById(fileId);
        if (!file) {
          results.push({ fileId, success: false, error: '文件不存在' });
          continue;
        }

        // 将字符串日期转换为Date对象
        const updatePayload = {
          ...updateData,
          expiresAt: updateData.expiresAt ? new Date(updateData.expiresAt) : undefined
        };

        const updatedFile = await fileDbService.updateFile(fileId, updatePayload);
        results.push({ fileId, success: true, data: updatedFile });
      } catch (error) {
        results.push({ 
          fileId, 
          success: false, 
          error: error instanceof Error ? error.message : '更新失败' 
        });
      }
    }

    return ApiResponseHelper.toNextResponse(
      ApiResponseHelper.success({ results })
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
 * DELETE /api/universal-file/files
 * 批量删除文件
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileIdsParam = searchParams.get('fileIds');

    if (!fileIdsParam) {
      throw ApiErrorFactory.validationError('fileIds', null, '文件ID列表不能为空');
    }

    const fileIds = fileIdsParam.split(',').filter(Boolean);
    ValidationHelper.arrayLength(fileIds, 'fileIds', 1, 100);
    
    fileIds.forEach((fileId, index) => {
      ValidationHelper.uuid(fileId, `fileIds[${index}]`);
    });

    // 批量删除文件（逻辑删除）
    const results = [];
    for (const fileId of fileIds) {
      try {
        const file = await fileDbService.getFileById(fileId);
        if (!file) {
          results.push({ fileId, success: false, error: '文件不存在' });
          continue;
        }

        // 逻辑删除 - 更新删除标记
        await fileDbService.updateFile(fileId, { 
          isDeleted: true,
          deletedAt: new Date()
        });

        results.push({ fileId, success: true });
      } catch (error) {
        results.push({ 
          fileId, 
          success: false, 
          error: error instanceof Error ? error.message : '删除失败' 
        });
      }
    }

    return ApiResponseHelper.toNextResponse(
      ApiResponseHelper.success({ results })
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