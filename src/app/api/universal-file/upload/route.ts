import { NextRequest, NextResponse } from 'next/server';
import {
  createOssFileServiceWithDrizzlePersistence,
  uploadFileAndResolveAccessUrl,
  fileMetadata,
  fileStorageProviders,
} from 'sa2kit/ossFile/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { loadEnvAndCreateOssFileConfigManager } from '@/lib/ossFile/env';
import { db } from '@/db';

/**
 * 通用文件上传API端点
 * POST /api/universal-file/upload
 */
export async function POST(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const moduleId = formData.get('moduleId') as string;
    const businessId = formData.get('businessId') as string;
    const folderPath = (formData.get('folderPath') || formData.get('customPath')) as string;
    const needsProcessing = formData.get('needsProcessing') === 'true';

    if (!file) {
      return NextResponse.json({ error: '未提供文件' }, { status: 400 });
    }

    if (!moduleId) {
      return NextResponse.json({ error: '未指定模块ID' }, { status: 400 });
    }

    const configManager = await loadEnvAndCreateOssFileConfigManager();
    const config = configManager.getConfig();
    const defaultStorageType = config.defaultStorage || 'local';
    const storageConfig = config.storageProviders[defaultStorageType];

    if (!storageConfig) {
      return NextResponse.json(
        { error: `未找到存储配置: ${defaultStorageType}` },
        { status: 500 },
      );
    }

    if (storageConfig.type === 'aliyun-oss') {
      const missing = [
        !storageConfig.region && 'region',
        !storageConfig.bucket && 'bucket',
        !storageConfig.accessKeyId && 'accessKeyId',
        !storageConfig.accessKeySecret && 'accessKeySecret',
      ].filter(Boolean);

      if (missing.length > 0) {
        return NextResponse.json(
          { error: `OSS配置缺失: ${missing.join(', ')}` },
          { status: 500 },
        );
      }
    }

    const fileService = await createOssFileServiceWithDrizzlePersistence({
      configManager,
      persistence: { db, fileMetadata, fileStorageProviders },
    });

    const { fileId, accessUrl, uploadResult } = await uploadFileAndResolveAccessUrl(
      fileService,
      {
        file,
        moduleId,
        businessId: businessId || 'default',
        customPath: folderPath || `${moduleId}/${businessId || 'default'}`,
        metadata: {
          uploadedBy: user.id || 'anonymous',
          uploadedAt: new Date().toISOString(),
          originalFileName: file.name,
        },
        needsProcessing,
        processingOptions: needsProcessing
          ? {
              type: 'image' as const,
              quality: 90,
              width: 800,
              height: 600,
              format: 'webp' as const,
              watermark: false,
            }
          : undefined,
      },
      user.id?.toString(),
    );

    return NextResponse.json({
      success: true,
      data: {
        fileId,
        originalName: uploadResult.originalName,
        storedName: uploadResult.storageName,
        size: uploadResult.size,
        mimeType: uploadResult.mimeType,
        storagePath: uploadResult.storagePath,
        cdnUrl: uploadResult.cdnUrl,
        accessUrl,
        moduleId: uploadResult.moduleId,
        businessId: uploadResult.businessId,
        createdAt: uploadResult.uploadTime,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('文件大小超过限制')) {
        return NextResponse.json({ error: '文件大小超过限制，请选择更小的文件' }, { status: 413 });
      }
      if (error.message.includes('不支持的文件类型')) {
        return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 });
      }
    }

    return NextResponse.json(
      {
        error: '文件上传失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 },
    );
  }
}
