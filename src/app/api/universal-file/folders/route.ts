/**
 * 通用文件服务 - 文件夹管理API
 * 提供文件夹的CRUD操作接口
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponseHelper, ApiErrorFactory, ValidationHelper } from '@/services/universalFile/utils/apiError';
import { FileDbService } from '@/services/universalFile/db/services/fileDbService';
import { FolderCreateParams, FolderUpdateParams } from '@/services/universalFile/types/api';
import { db } from '@/db';

// 初始化服务
const fileDbService = new FileDbService(db);

/**
 * GET /api/universal-file/folders
 * 查询文件夹列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId') || undefined;
    const moduleId = searchParams.get('moduleId') || undefined;
    const businessId = searchParams.get('businessId') || undefined;
    const includeChildren = searchParams.get('includeChildren') === 'true';

    // 参数验证
    if (parentId) {
      ValidationHelper.uuid(parentId, 'parentId');
    }

    // 查询文件夹列表
    const folders = await fileDbService.getFolders({
      parentId,
      moduleId,
      businessId,
    });

    // 转换为API响应格式
    const responseData = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      moduleId: folder.moduleId,
      businessId: folder.businessId,
      path: folder.path,
      depth: folder.depth,
      sortOrder: folder.sortOrder,
      description: folder.description,
      isSystem: folder.isSystem,
      createdBy: folder.createdBy,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    }));

    return ApiResponseHelper.toNextResponse(
      ApiResponseHelper.success({ folders: responseData })
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
 * POST /api/universal-file/folders
 * 创建文件夹
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const createParams: FolderCreateParams = body;

    // 参数验证
    ValidationHelper.required(createParams.name, 'name');
    ValidationHelper.stringLength(createParams.name, 'name', 1, 100);

    if (createParams.parentId) {
      ValidationHelper.uuid(createParams.parentId, 'parentId');
    }

    if (createParams.moduleId) {
      ValidationHelper.stringLength(createParams.moduleId, 'moduleId', 1, 50);
    }

    if (createParams.businessId) {
      ValidationHelper.stringLength(createParams.businessId, 'businessId', 1, 100);
    }

    if (createParams.description) {
      ValidationHelper.stringLength(createParams.description, 'description', 0, 500);
    }

    // 检查文件夹名称冲突
    const existingFolders = await fileDbService.getFolders({
      parentId: createParams.parentId,
      moduleId: createParams.moduleId,
      businessId: createParams.businessId,
    });

    const nameConflict = existingFolders.find(
      folder => folder.name === createParams.name
    );

    if (nameConflict) {
      throw ApiErrorFactory.conflict('文件夹', '同名文件夹已存在');
    }

    // 计算路径和深度
    let path = createParams.name;
    let depth = 0;

    if (createParams.parentId) {
      const parentFolder = await fileDbService.getFolderById(createParams.parentId);
      if (parentFolder) {
        path = `${parentFolder.path}/${createParams.name}`;
        depth = parentFolder.depth + 1;
      }
    }

    // 创建文件夹
    const newFolder = await fileDbService.createFolder({
      id: crypto.randomUUID(),
      name: createParams.name,
      parentId: createParams.parentId,
      moduleId: createParams.moduleId,
      businessId: createParams.businessId,
      path,
      depth,
      sortOrder: createParams.sortOrder || 0,
      description: createParams.description,
      isSystem: false,
      createdBy: 'system', // TODO: 从会话获取用户ID
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return ApiResponseHelper.toNextResponse(
      ApiResponseHelper.success({
        id: newFolder.id,
        name: newFolder.name,
        parentId: newFolder.parentId,
        moduleId: newFolder.moduleId,
        businessId: newFolder.businessId,
        path: newFolder.path,
        depth: newFolder.depth,
        sortOrder: newFolder.sortOrder,
        description: newFolder.description,
        isSystem: newFolder.isSystem,
        createdBy: newFolder.createdBy,
        createdAt: newFolder.createdAt,
        updatedAt: newFolder.updatedAt,
      }),
      201
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
 * PUT /api/universal-file/folders
 * 更新文件夹
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { folderId, updateData }: { folderId: string, updateData: FolderUpdateParams } = body;

    // 参数验证
    ValidationHelper.required(folderId, 'folderId');
    ValidationHelper.uuid(folderId, 'folderId');

    if (updateData.name) {
      ValidationHelper.stringLength(updateData.name, 'name', 1, 100);
    }

    if (updateData.parentId) {
      ValidationHelper.uuid(updateData.parentId, 'parentId');
    }

    if (updateData.description !== undefined) {
      ValidationHelper.stringLength(updateData.description, 'description', 0, 500);
    }

    // 检查文件夹是否存在
    const folder = await fileDbService.getFolderById(folderId);
    if (!folder) {
      throw ApiErrorFactory.folderNotFound(folderId);
    }

    // 检查名称冲突（如果更新了名称）
    if (updateData.name && updateData.name !== folder.name) {
      const existingFolders = await fileDbService.getFolders({
        parentId: updateData.parentId || folder.parentId || undefined,
        moduleId: folder.moduleId || undefined,
        businessId: folder.businessId || undefined,
      });

      const nameConflict = existingFolders.find(
        f => f.name === updateData.name && f.id !== folderId
      );

      if (nameConflict) {
        throw ApiErrorFactory.conflict('文件夹', '同名文件夹已存在');
      }
    }

    // 更新文件夹
    const updatedFolder = await fileDbService.updateFolder(folderId, updateData);

    return ApiResponseHelper.toNextResponse(
      ApiResponseHelper.success({
        id: updatedFolder.id,
        name: updatedFolder.name,
        parentId: updatedFolder.parentId,
        moduleId: updatedFolder.moduleId,
        businessId: updatedFolder.businessId,
        path: updatedFolder.path,
        depth: updatedFolder.depth,
        sortOrder: updatedFolder.sortOrder,
        description: updatedFolder.description,
        isSystem: updatedFolder.isSystem,
        createdBy: updatedFolder.createdBy,
        createdAt: updatedFolder.createdAt,
        updatedAt: updatedFolder.updatedAt,
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
 * DELETE /api/universal-file/folders
 * 删除文件夹
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const recursive = searchParams.get('recursive') === 'true';

    if (!folderId) {
      throw ApiErrorFactory.validationError('folderId', null, '文件夹ID不能为空');
    }

    ValidationHelper.uuid(folderId, 'folderId');

    // 检查文件夹是否存在
    const folder = await fileDbService.getFolderById(folderId);
    if (!folder) {
      throw ApiErrorFactory.folderNotFound(folderId);
    }

    // 检查是否为系统文件夹
    if (folder.isSystem) {
      throw ApiErrorFactory.authorizationError('文件夹', '删除');
    }

    // 如果不是递归删除，检查文件夹是否为空
    if (!recursive) {
      // 检查子文件夹
      const subFolders = await fileDbService.getFolders({ parentId: folderId });
      if (subFolders.length > 0) {
        throw ApiErrorFactory.folderNotEmpty(folderId, 0, subFolders.length);
      }

      // 检查文件
      const files = await fileDbService.getFiles({ folderId, isDeleted: false });
      if (files.total > 0) {
        throw ApiErrorFactory.folderNotEmpty(folderId, files.total, 0);
      }
    }

    // 删除文件夹
    await fileDbService.deleteFolder(folderId, recursive);

    return ApiResponseHelper.toNextResponse(
      ApiResponseHelper.success({ folderId, deleted: true })
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