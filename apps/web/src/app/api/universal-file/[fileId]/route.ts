import { NextRequest, NextResponse } from 'next/server';
import { getProfileOssFileBootstrap } from '@/lib/ossFile/env';

/**
 * GET /api/universal-file/[fileId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json({ error: '文件ID不能为空' }, { status: 400 });
    }

    const accessUrl = await getProfileOssFileBootstrap().getFileUrl(fileId);

    if (!accessUrl) {
      return NextResponse.json({ error: '文件不存在或无法解析访问地址' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        fileId,
        accessUrl,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: '文件获取失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 },
    );
  }
}
