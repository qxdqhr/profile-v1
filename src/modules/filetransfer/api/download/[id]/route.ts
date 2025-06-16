/**
 * 文件下载 API 路由
 * 
 * 提供文件下载功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/modules/auth/server';
import { fileTransferDbService } from '../../../db/fileTransferDbService';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * GET /api/filetransfer/download/:id
 * 
 * 下载指定ID的文件
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const { id } = params;

    // 获取文件信息
    const [transfer] = await fileTransferDbService.getTransfers({
      userId: user.id.toString(),
      page: 1,
      limit: 1,
    });

    if (!transfer) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }

    // 读取文件
    const fileBuffer = await readFile(transfer.filePath);

    // 更新下载次数
    await fileTransferDbService.incrementDownloadCount(id);

    // 返回文件
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': transfer.fileType,
        'Content-Disposition': `attachment; filename="${transfer.fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('下载文件失败:', error);
    return NextResponse.json(
      { error: '下载文件失败' },
      { status: 500 }
    );
  }
} 