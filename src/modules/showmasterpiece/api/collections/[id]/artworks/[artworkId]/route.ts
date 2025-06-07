import { NextRequest, NextResponse } from 'next/server';
import { artworksDbService } from '../../../../../db/masterpiecesDbService';
import { validateApiAuth } from '@/modules/auth/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; artworkId: string } }
) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    // 检查请求体大小
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB 限制
      return NextResponse.json(
        { error: '请求数据太大，请压缩图片后重试' },
        { status: 413 }
      );
    }

    const collectionId = parseInt(params.id);
    const artworkId = parseInt(params.artworkId);
    const artworkData = await request.json();
    const updatedArtwork = await artworksDbService.updateArtwork(collectionId, artworkId, artworkData);
    return NextResponse.json(updatedArtwork);
  } catch (error) {
    console.error('更新作品失败:', error);
    // 检查是否是请求体过大的错误
    if (error instanceof Error && error.message.includes('body')) {
      return NextResponse.json(
        { error: '请求数据太大，请压缩图片后重试' },
        { status: 413 }
      );
    }
    return NextResponse.json(
      { error: '更新作品失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; artworkId: string } }
) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const collectionId = parseInt(params.id);
    const artworkId = parseInt(params.artworkId);
    await artworksDbService.deleteArtwork(collectionId, artworkId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除作品失败:', error);
    return NextResponse.json(
      { error: '删除作品失败' },
      { status: 500 }
    );
  }
} 