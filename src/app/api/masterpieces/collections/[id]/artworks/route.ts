import { NextRequest, NextResponse } from 'next/server';
import { artworksDbService } from '@/db/services/masterpiecesDbService';
import { validateApiAuth } from '@/modules/auth/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const artworkData = await request.json();
    const artwork = await artworksDbService.addArtworkToCollection(collectionId, artworkData);
    return NextResponse.json(artwork);
  } catch (error) {
    console.error('添加作品失败:', error);
    // 检查是否是请求体过大的错误
    if (error instanceof Error && error.message.includes('body')) {
      return NextResponse.json(
        { error: '请求数据太大，请压缩图片后重试' },
        { status: 413 }
      );
    }
    return NextResponse.json(
      { error: '添加作品失败' },
      { status: 500 }
    );
  }
} 