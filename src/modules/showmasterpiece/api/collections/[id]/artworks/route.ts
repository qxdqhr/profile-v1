import { NextRequest, NextResponse } from 'next/server';
import { artworksDbService } from '../../../../db/masterpiecesDbService';
import { validateApiAuth } from '@/modules/auth/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const artworkData = await request.json();
    const artwork = await artworksDbService.addArtworkToCollection(collectionId, artworkData);
    return NextResponse.json(artwork);
  } catch (error) {
    console.error('添加作品失败:', error);
    // 检查是否是请求体过大的错误
    if (error instanceof Error && error.message.includes('body')) {
      return NextResponse.json(
        { error: '请求数据太大，请压缩图片后重试' },
        { status: 413 }
      );
    }
    return NextResponse.json(
      { error: '添加作品失败' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const collectionId = parseInt(params.id);
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    
    if (action === 'reorder') {
      // 批量重排序
      const { artworkOrders } = await request.json();
      
      if (!Array.isArray(artworkOrders) || 
          !artworkOrders.every(item => 
            typeof item.id === 'number' && 
            typeof item.pageOrder === 'number'
          )) {
        return NextResponse.json(
          { error: '无效的排序数据格式' },
          { status: 400 }
        );
      }

      await artworksDbService.updateArtworkOrder(collectionId, artworkOrders);
      
      return NextResponse.json({ success: true, message: '作品顺序已更新' });
    }
    
    if (action === 'move') {
      // 移动到指定位置
      const { artworkId, targetOrder } = await request.json();
      
      if (typeof artworkId !== 'number' || typeof targetOrder !== 'number') {
        return NextResponse.json(
          { error: '无效的移动参数' },
          { status: 400 }
        );
      }

      await artworksDbService.moveArtwork(collectionId, artworkId, targetOrder);
      
      return NextResponse.json({ success: true, message: '作品位置已更新' });
    }
    
    if (action === 'up') {
      // 上移
      const { artworkId } = await request.json();
      
      if (typeof artworkId !== 'number') {
        return NextResponse.json(
          { error: '无效的作品ID' },
          { status: 400 }
        );
      }

      await artworksDbService.moveArtworkUp(collectionId, artworkId);
      
      return NextResponse.json({ success: true, message: '作品已上移' });
    }
    
    if (action === 'down') {
      // 下移
      const { artworkId } = await request.json();
      
      if (typeof artworkId !== 'number') {
        return NextResponse.json(
          { error: '无效的作品ID' },
          { status: 400 }
        );
      }

      await artworksDbService.moveArtworkDown(collectionId, artworkId);
      
      return NextResponse.json({ success: true, message: '作品已下移' });
    }
    
    return NextResponse.json(
      { error: '不支持的操作类型' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('作品排序操作失败:', error);
    
    // 根据错误类型返回适当的状态码
    const errorMessage = error instanceof Error ? error.message : '操作失败';
    
    // 检查是否是边界条件错误
    if (errorMessage.includes('已经在最前面') || errorMessage.includes('已经在最后面')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 409 } // Conflict
      );
    }
    
    // 检查是否是不存在错误
    if (errorMessage.includes('不存在') || errorMessage.includes('无效')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 } // Not Found
      );
    }
    
    // 其他错误
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// 添加GET方法用于获取指定画集的所有作品
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const collectionId = parseInt(params.id);
    
    // 验证参数
    if (isNaN(collectionId)) {
      return NextResponse.json(
        { error: '无效的画集ID' },
        { status: 400 }
      );
    }

    const artworks = await artworksDbService.getArtworksByCollection(collectionId);
    
    // 设置缓存头
    const response = NextResponse.json(artworks);
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error('获取作品列表失败:', error);
    return NextResponse.json(
      { error: '获取作品列表失败' },
      { status: 500 }
    );
  }
} 