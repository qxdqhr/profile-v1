import { NextRequest, NextResponse } from 'next/server';
import { artworksDbService } from '@/db/services/masterpiecesDbService';
import { validateApiAuth, createUnauthorizedResponse } from '@/utils/authUtils';

// 配置请求体解析器，增加大小限制
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; artworkId: string } }
) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      const { error, status } = createUnauthorizedResponse();
      return NextResponse.json({ error }, { status });
    }

    const collectionId = parseInt(params.id);
    const artworkId = parseInt(params.artworkId);
    const artworkData = await request.json();
    const updatedArtwork = await artworksDbService.updateArtwork(collectionId, artworkId, artworkData);
    return NextResponse.json(updatedArtwork);
  } catch (error) {
    console.error('更新作品失败:', error);
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
      const { error, status } = createUnauthorizedResponse();
      return NextResponse.json({ error }, { status });
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