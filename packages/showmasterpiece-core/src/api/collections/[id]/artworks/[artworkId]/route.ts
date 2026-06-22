import { NextRequest, NextResponse } from 'next/server';
import { artworksDbService } from '@profile/showmasterpiece-core/masterpiecesDbService';
import { isAuthFailure, requireAdmin } from '../../../../lib/auth';
import { apiError, logRouteError } from '../../../../lib/response';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; artworkId: string }> }
) {
  try {
    // 验证用户权限
    const auth = await requireAdmin(request);
    if (isAuthFailure(auth)) return auth;

    // 检查请求体大小
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB 限制
      return NextResponse.json(
        { error: '请求数据太大，请压缩图片后重试' },
        { status: 413 }
      );
    }

    const resolvedParams = await params;
    const collectionId = parseInt(resolvedParams.id);
    const artworkId = parseInt(resolvedParams.artworkId);
    const artworkData = await request.json();
    const updatedArtwork = await artworksDbService.updateArtwork(collectionId, artworkId, artworkData);
    return NextResponse.json(updatedArtwork);
  } catch (error) {
    logRouteError('更新作品失败:', error);
    if (error instanceof Error && error.message.includes('body')) {
      return apiError('请求数据太大，请压缩图片后重试', 413);
    }
    return apiError('更新作品失败', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; artworkId: string }> }
) {
  try {
    // 验证用户权限
    const auth = await requireAdmin(request);
    if (isAuthFailure(auth)) return auth;

    const resolvedParams = await params;
    const collectionId = parseInt(resolvedParams.id);
    const artworkId = parseInt(resolvedParams.artworkId);
    
    await artworksDbService.deleteArtwork(collectionId, artworkId);
    return NextResponse.json({ success: true });
  } catch (error) {
    logRouteError('删除作品失败:', error);
    return apiError('删除作品失败', 500);
  }
} 
