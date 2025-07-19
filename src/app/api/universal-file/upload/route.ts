import { NextRequest, NextResponse } from 'next/server';
import { createUniversalFileServiceWithConfigManager } from '@/services/universalFile/UniversalFileService';
import { validateApiAuth } from '@/modules/auth/server';

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

    // 验证文件类型（目前只支持图片）
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '只支持图片文件类型' },
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
      fileService = await createUniversalFileServiceWithConfigManager();
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
        accessUrl: uploadResult.cdnUrl || `/uploads/${uploadResult.storagePath}`,
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