 /**
 * 文件传输配置 API 路由
 * 
 * 提供文件传输配置的获取和更新功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/modules/auth/server';
import type { FileTransferConfig } from '../../types';

/**
 * GET /api/filetransfer/config
 * 
 * 获取文件传输配置
 */
export async function GET(request: NextRequest) {
  console.log('🔧 [API/config] 收到获取配置请求');
  
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      console.log('❌ [API/config] 未授权的访问');
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    // 返回默认配置（可以后续从数据库或环境变量中读取）
    const config: FileTransferConfig = {
      id: 'default',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB
      allowedFileTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed',
        'application/json',
        'application/javascript',
        'text/css',
        'text/html'
      ],
      defaultExpirationDays: parseInt(process.env.DEFAULT_EXPIRATION_DAYS || '7'),
      enableEncryption: process.env.ENABLE_ENCRYPTION === 'true',
      enableCompression: process.env.ENABLE_COMPRESSION === 'true',
      storagePath: process.env.FILE_STORAGE_PATH || 'uploads'
    };

    console.log('✅ [API/config] 配置获取成功');
    return NextResponse.json(config);
    
  } catch (error) {
    console.error('💥 [API/config] 获取配置失败:', error);
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/filetransfer/config
 * 
 * 更新文件传输配置（仅管理员）
 */
export async function PUT(request: NextRequest) {
  console.log('🔧 [API/config] 收到更新配置请求');
  
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      console.log('❌ [API/config] 未授权的访问');
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    // TODO: 添加管理员权限检查
    // if (!user.isAdmin) {
    //   return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    // }

    const configData = await request.json();
    console.log('📝 [API/config] 配置更新参数:', configData);

    // 验证配置数据
    if (!configData.maxFileSize || configData.maxFileSize <= 0) {
      console.log('❌ [API/config] 无效的最大文件大小');
      return NextResponse.json(
        { error: '最大文件大小必须大于0' },
        { status: 400 }
      );
    }

    if (!Array.isArray(configData.allowedFileTypes) || configData.allowedFileTypes.length === 0) {
      console.log('❌ [API/config] 无效的文件类型列表');
      return NextResponse.json(
        { error: '允许的文件类型列表不能为空' },
        { status: 400 }
      );
    }

    // TODO: 实际的配置更新逻辑（保存到数据库）
    // 目前返回成功响应
    console.log('✅ [API/config] 配置更新成功');
    return NextResponse.json({ 
      success: true, 
      message: '配置更新成功',
      config: configData 
    });
    
  } catch (error) {
    console.error('💥 [API/config] 更新配置失败:', error);
    return NextResponse.json(
      { error: '更新配置失败' },
      { status: 500 }
    );
  }
}