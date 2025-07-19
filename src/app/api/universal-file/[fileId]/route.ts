import { NextRequest, NextResponse } from 'next/server';
import { createUniversalFileServiceWithConfigManager } from '@/services/universalFile/UniversalFileService';

/**
 * 通用文件获取API端点
 * GET /api/universal-file/[fileId]
 * 
 * 获取文件信息和访问URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;
    
    console.log('📄 [通用文件服务] 收到文件获取请求:', fileId);

    if (!fileId) {
      return NextResponse.json(
        { error: '文件ID不能为空' },
        { status: 400 }
      );
    }

    // 初始化文件服务
    const fileService = await createUniversalFileServiceWithConfigManager();

    // 生成访问URL
    const accessUrl = await fileService.getFileUrl(fileId);

    console.log('✅ [通用文件服务] 文件URL获取成功:', {
      fileId,
      accessUrl
    });

    // 返回文件信息（简化版本，只返回访问URL）
    return NextResponse.json({
      success: true,
      data: {
        fileId,
        accessUrl
      }
    });

  } catch (error) {
    console.error('❌ [通用文件服务] 文件获取失败:', error);
    
    return NextResponse.json(
      { 
        error: '文件获取失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 