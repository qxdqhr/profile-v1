import { NextRequest, NextResponse } from 'next/server';
import { collectionsDbService } from '@/db/services/masterpiecesDbService';
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
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      const { error, status } = createUnauthorizedResponse();
      return NextResponse.json({ error }, { status });
    }

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
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      const { error, status } = createUnauthorizedResponse();
      return NextResponse.json({ error }, { status });
    }

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