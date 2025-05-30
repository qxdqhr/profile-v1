import { NextRequest, NextResponse } from 'next/server';
import { collectionsDbService } from '@/db/services/masterpiecesDbService';
import { validateApiAuth, createUnauthorizedResponse } from '@/utils/authUtils';

export async function GET() {
  try {
    const collections = await collectionsDbService.getAllCollections();
    return NextResponse.json(collections);
  } catch (error) {
    console.error('获取画集失败:', error);
    return NextResponse.json(
      { error: '获取画集失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      const { error, status } = createUnauthorizedResponse();
      return NextResponse.json({ error }, { status });
    }

    const collectionData = await request.json();
    const newCollection = await collectionsDbService.createCollection(collectionData);
    return NextResponse.json(newCollection);
  } catch (error) {
    console.error('创建画集失败:', error);
    return NextResponse.json(
      { error: '创建画集失败' },
      { status: 500 }
    );
  }
} 