import { NextRequest, NextResponse } from 'next/server';
import { createUniversalFileServiceWithConfigManager } from '@/services/universalFile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const moduleId = formData.get('moduleId') as string || 'mmd';
    const businessId = formData.get('businessId') as string || 'resources';

    if (!file) {
      return NextResponse.json(
        { error: '没有文件' },
        { status: 400 }
      );
    }

    console.log('📤 开始上传文件:', file.name, file.size, 'bytes');

    // 初始化文件服务
    const fileService = await createUniversalFileServiceWithConfigManager();

    // 转换 File 为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 创建一个临时的 File 对象（Node.js 环境）
    const uploadFile = {
      name: file.name,
      type: file.type,
      size: file.size,
      arrayBuffer: async () => arrayBuffer,
      text: async () => buffer.toString(),
      slice: () => new Blob([buffer]),
      stream: () => new ReadableStream(),
      lastModified: Date.now(),
      webkitRelativePath: '',
    } as File;

    // 上传文件
    const result = await fileService.uploadFile(
      {
        file: uploadFile,
        moduleId,
        businessId,
        permission: 'public',
        needsProcessing: false,
      },
      undefined, // 使用默认存储
      (progress) => {
        console.log('📊 上传进度:', progress.progress, '%');
      }
    );

    console.log('✅ 文件上传成功:', result.url);

    return NextResponse.json({
      success: true,
      file: result,
    });

  } catch (error) {
    console.error('❌ 文件上传失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '上传失败',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

