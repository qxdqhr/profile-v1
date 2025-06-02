import { NextRequest, NextResponse } from 'next/server';
import { collectionsDbService } from '@/db/services/masterpiecesDbService';
import { validateApiAuth } from '@/modules/auth/server';

export async function GET() {
  try {
    const collections = await collectionsDbService.getAllCollections();
    return NextResponse.json(collections);
  } catch (error) {
    console.error('获取画集列表失败:', error);
    return NextResponse.json(
      { error: '获取画集列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const collectionData = await request.json();
    const newCollection = await collectionsDbService.createCollection(collectionData);
    return NextResponse.json(newCollection);
  } catch (error) {
    console.error('创建画集失败:', error);
    // 检查是否是请求体过大的错误
    if (error instanceof Error && error.message.includes('body')) {
      return NextResponse.json(
        { error: '请求数据太大，请压缩图片后重试' },
        { status: 413 }
      );
    }
    return NextResponse.json(
      { error: '创建画集失败' },
      { status: 500 }
    );
  }
} 