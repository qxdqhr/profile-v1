import { NextRequest, NextResponse } from 'next/server';
import { artworksDbService } from '@/db/services/masterpiecesDbService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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