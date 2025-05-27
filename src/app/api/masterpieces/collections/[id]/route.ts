import { NextRequest, NextResponse } from 'next/server';
import { collectionsDbService } from '@/db/services/masterpiecesDbService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const collectionData = await request.json();
    const updatedCollection = await collectionsDbService.updateCollection(id, collectionData);
    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error('更新画集失败:', error);
    return NextResponse.json(
      { error: '更新画集失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await collectionsDbService.deleteCollection(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除画集失败:', error);
    return NextResponse.json(
      { error: '删除画集失败' },
      { status: 500 }
    );
  }
} 