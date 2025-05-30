import { NextRequest, NextResponse } from 'next/server';
import { artworksDbService } from '@/db/services/masterpiecesDbService';
import { validateApiAuth, createUnauthorizedResponse } from '@/utils/authUtils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      const { error, status } = createUnauthorizedResponse();
      return NextResponse.json({ error }, { status });
    }

    const collectionId = parseInt(params.id);
    const artworkData = await request.json();
    const newArtwork = await artworksDbService.addArtworkToCollection(collectionId, artworkData);
    return NextResponse.json(newArtwork);
  } catch (error) {
    console.error('添加作品失败:', error);
    return NextResponse.json(
      { error: '添加作品失败' },
      { status: 500 }
    );
  }
} 