import { NextRequest, NextResponse } from 'next/server';
import { collectionsDbService } from '../../../db/masterpiecesDbService';
import { validateApiAuth } from '@/modules/auth/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const collectionData = await request.json();
    const updatedCollection = await collectionsDbService.updateCollection(collectionId, collectionData);
    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error('更新画集失败:', error);
    // 检查是否是请求体过大的错误
    if (error instanceof Error && error.message.includes('body')) {
      return NextResponse.json(
        { error: '请求数据太大，请压缩图片后重试' },
        { status: 413 }
      );
    }
    return NextResponse.json(
      { error: '更新画集失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const collectionId = parseInt(params.id);
    
    // 从查询参数中获取事件ID（用于验证）
    const url = new URL(request.url);
    const eventIdParam = url.searchParams.get('eventId');
    const eventId = eventIdParam ? parseInt(eventIdParam) : undefined;

    await collectionsDbService.deleteCollection(collectionId, eventId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除画集失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除画集失败' },
      { status: 500 }
    );
  }
} 