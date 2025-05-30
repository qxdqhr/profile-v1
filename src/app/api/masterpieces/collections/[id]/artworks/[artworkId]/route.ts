import { NextRequest, NextResponse } from 'next/server';
import { artworksDbService } from '@/db/services/masterpiecesDbService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; artworkId: string } }
) {
  try {
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