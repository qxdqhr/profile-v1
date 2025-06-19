 /**
 * 特定文件传输记录 API 路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/modules/auth/server';
import { fileTransferService } from '@/modules/filetransfer/services/fileTransferService';

/**
 * DELETE /api/filetransfer/transfers/:id
 * 
 * 删除指定的文件传输记录
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) 
      {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const { id } = params;

    // 删除传输记录
    await fileTransferService.deleteTransfer(id, user.id.toString());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除传输记录失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除传输记录失败' },
      { status: 500 }
    );
  }
}