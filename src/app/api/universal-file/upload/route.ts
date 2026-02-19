import { NextRequest, NextResponse } from 'next/server';
import {
  UniversalFileService,
  createFileServiceConfigWithConfigManager,
  createDrizzleFileRepository,
  fileMetadata,
  fileStorageProviders,
} from 'sa2kit/universalFile/server';
import { validateApiAuth } from '@/modules/auth/server';
import { EnvConfigService } from '@/modules/configManager/services/envConfigService';
import '@/modules/showmasterpiece/sa2kit-init';
import { db } from '@/db';

/**
 * 通用文件上传API端点
 * POST /api/universal-file/upload
 * 
 * 支持多种存储方式：本地存储、阿里云OSS等
 * 支持多模块使用：ShowMasterpiece、MMD、CardMaker等
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📤 [通用文件服务] 收到文件上传请求');

    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      console.log('❌ [通用文件服务] 用户未授权');
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }
    console.log('✅ [通用文件服务] 用户授权验证通过:', user.id || 'anonymous');

    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const moduleId = formData.get('moduleId') as string;
    const businessId = formData.get('businessId') as string;
    const folderPath = formData.get('folderPath') as string;
    const needsProcessing = formData.get('needsProcessing') === 'true';

    // 验证必需字段
    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }

    if (!moduleId) {
      return NextResponse.json(
        { error: '未指定模块ID' },
        { status: 400 }
      );
    }

    console.log('📋 [通用文件服务] 上传参数:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      moduleId,
      businessId,
      folderPath,
      needsProcessing,
      userId: user.id
    });

    // 初始化文件服务
    console.log('🔧 [通用文件服务] 开始初始化文件服务...');
    let fileService;
    try {
      const envConfigService = EnvConfigService.getInstance();
      const envConfig = await envConfigService.loadConfigFromDatabase();
      envConfigService.setEnvironmentVariables(envConfig);

      // 1. 根据模块ID加载相应的配置管理器
      let configManager;
      if (moduleId === 'showmasterpiece') {
        // ShowMasterpiece模块使用独立的配置系统（服务端入口）
        const { getShowMasterpieceFileConfig } = await import('sa2kit/showmasterpiece');
        configManager = await getShowMasterpieceFileConfig();
        console.log('🎨 [通用文件服务] 使用ShowMasterpiece独立配置');
      } else {
        // 其他模块使用全局配置管理器
        configManager = await createFileServiceConfigWithConfigManager();
        console.log('🌐 [通用文件服务] 使用全局配置管理器');
      }
      const config = configManager.getConfig();

      // 2. 创建数据库持久化仓储
      const repository = createDrizzleFileRepository({
        db,
        fileMetadata,
        fileStorageProviders,
      });

      // 3. 获取默认存储配置
      const defaultStorageType = config.defaultStorage || 'local';
      const storageConfig = config.storageProviders[defaultStorageType];

      if (!storageConfig) {
        console.error('❌ [通用文件服务] 未找到存储配置:', defaultStorageType);
        return NextResponse.json(
          { error: `未找到存储配置: ${defaultStorageType}` },
          { status: 500 }
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
          console.error('❌ [通用文件服务] OSS配置缺失:', missing);
          return NextResponse.json(
            { error: `OSS配置缺失: ${missing.join(', ')}` },
            { status: 500 }
          );
        }
      }

      console.log('📦 [通用文件服务] 使用存储配置:', {
        type: storageConfig.type,
        enabled: storageConfig.enabled,
      });

      // 4. 构建 sa2kit 配置
      const serviceConfig = {
        // storage 字段是 sa2kit 要求的
        storage: storageConfig,
        // cdn 配置可选
        cdn: config.defaultCDN !== 'none' ? config.cdnProviders[config.defaultCDN] : undefined,
        maxFileSize: config.maxFileSize,
        allowedMimeTypes: config.allowedMimeTypes,
        cache: {
          enabled: true,
          metadataTTL: config.cache.metadataTTL,
          urlTTL: config.cache.urlTTL,
        },
        persistence: {
          enabled: true,
          repository,
          autoPersist: true,
        },
        // 额外字段用于兼容旧的配置结构和 registerDefaultStorageProviders 逻辑
        defaultStorage: defaultStorageType,
        defaultCDN: config.defaultCDN,
        storageProviders: config.storageProviders,
      };

      fileService = new UniversalFileService(serviceConfig as any);
      await fileService.initialize();
      console.log('✅ [通用文件服务] 文件服务初始化成功');
    } catch (initError) {
      console.error('❌ [通用文件服务] 文件服务初始化失败:', initError);
      return NextResponse.json(
        {
          error: '文件服务初始化失败',
          details: initError instanceof Error ? initError.message : '未知错误'
        },
        { status: 500 }
      );
    }

    // 构建上传信息
    const uploadInfo = {
      file,
      moduleId,
      businessId: businessId || 'default',
      customPath: folderPath || `${moduleId}/${businessId || 'default'}`,
      metadata: {
        uploadedBy: user.id || 'anonymous',
        uploadedAt: new Date().toISOString(),
        originalFileName: file.name
      },
      needsProcessing,
      processingOptions: needsProcessing ? {
        type: 'image' as const,
        quality: 90,
        width: 800,
        height: 600,
        format: 'webp' as const,
        watermark: false
      } : undefined
    };

    console.log('📦 [通用文件服务] 上传信息构建完成:', {
      moduleId: uploadInfo.moduleId,
      businessId: uploadInfo.businessId,
      customPath: uploadInfo.customPath,
      needsProcessing: uploadInfo.needsProcessing
    });

    // 执行文件上传
    console.log('🚀 [通用文件服务] 开始文件上传...');
    let uploadResult;
    try {
      uploadResult = await fileService.uploadFile(uploadInfo);
      console.log('✅ [通用文件服务] 文件上传成功:', {
        fileId: uploadResult.id,
        storagePath: uploadResult.storagePath,
        cdnUrl: uploadResult.cdnUrl,
        size: uploadResult.size
      });
    } catch (uploadError) {
      console.error('❌ [通用文件服务] 文件上传执行失败:', uploadError);
      return NextResponse.json(
        {
          error: '文件上传执行失败',
          details: uploadError instanceof Error ? uploadError.message : '未知错误'
        },
        { status: 500 }
      );
    }

    // 获取访问URL
    let accessUrl: string;
    if (uploadResult.cdnUrl) {
      accessUrl = uploadResult.cdnUrl;
    } else {
      // 如果没有CDN URL，使用 storagePath 或调用 getFileUrl
      try {
        accessUrl = await fileService.getFileUrl(uploadResult.id, user.id?.toString());
      } catch (error) {
        console.warn('⚠️ [通用文件服务] 获取文件访问URL失败，使用默认路径:', error);
        accessUrl = `/uploads/${uploadResult.storagePath}`;
      }
    }

    // 返回结果
    return NextResponse.json({
      success: true,
      data: {
        fileId: uploadResult.id,
        originalName: uploadResult.originalName,
        storedName: uploadResult.storageName,
        size: uploadResult.size,
        mimeType: uploadResult.mimeType,
        storagePath: uploadResult.storagePath,
        cdnUrl: uploadResult.cdnUrl,
        accessUrl: accessUrl,
        moduleId: uploadResult.moduleId,
        businessId: uploadResult.businessId,
        createdAt: uploadResult.uploadTime
      }
    });

  } catch (error) {
    console.error('❌ [通用文件服务] 文件上传失败:', error);

    // 记录详细的错误信息
    if (error instanceof Error) {
      console.error('❌ [通用文件服务] 错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });

      // 处理特定错误类型
      if (error.message.includes('文件大小超过限制')) {
        return NextResponse.json(
          { error: '文件大小超过限制，请选择更小的文件' },
          { status: 413 }
        );
      }

      if (error.message.includes('不支持的文件类型')) {
        return NextResponse.json(
          { error: '不支持的文件类型' },
          { status: 400 }
        );
      }

      if (error.message.includes('存储提供者不存在')) {
        return NextResponse.json(
          { error: '存储服务配置错误' },
          { status: 500 }
        );
      }

      if (error.message.includes('数据库')) {
        return NextResponse.json(
          { error: '数据库操作失败' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error: '文件上传失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
