import { NextRequest, NextResponse } from 'next/server';
import { collectionsDbService } from '../../db/masterpiecesDbService';
import { validateApiAuth } from '@/modules/auth/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const overview = searchParams.get('overview') === 'true';
    
    // 如果请求overview，返回不包含作品详情的快速响应
    if (overview) {
      const collectionsOverview = await collectionsDbService.getCollectionsOverview();
      
      // 设置缓存头
      const response = NextResponse.json(collectionsOverview);
      response.headers.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
      return response;
    }
    
    // 完整的画集数据（包含所有作品）
    const collections = await collectionsDbService.getAllCollections();
    
    // 设置缓存头
    const response = NextResponse.json(collections);
    response.headers.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
    return response;
    
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