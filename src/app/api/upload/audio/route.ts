import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * 处理音频文件上传的API路由
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }
    
    // 检查是否是音频文件
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: '文件类型必须是音频' },
        { status: 400 }
      );
    }
    
    // 创建保存路径
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
    
    // 确保上传目录存在
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // 生成唯一文件名，保留文件扩展名
    const originalName = file.name;
    const extension = path.extname(originalName);
    const fileName = `${randomUUID()}${extension}`;
    const filePath = path.join(uploadDir, fileName);
    
    // 保存文件
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);
    
    // 返回文件的URL路径
    const fileUrl = `/uploads/audio/${fileName}`;
    
    return NextResponse.json({
      url: fileUrl,
      filename: originalName,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    );
  }
}

// 设置请求体大小限制 (10MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 