import { NextRequest, NextResponse } from 'next/server';
import { artworksDbService, collectionsDbService } from '../../../../db/masterpiecesDbService';
import { validateApiAuth } from '@/modules/auth/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🎨 开始创建作品，画集ID:', params.id);
    
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      console.log('❌ 用户未授权');
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }
    console.log('✅ 用户授权验证通过:', user.id || 'anonymous');

    // 检查请求体大小
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB 限制
      console.log('❌ 请求体过大:', contentLength);
      return NextResponse.json(
        { error: '请求数据太大，请压缩图片后重试' },
        { status: 413 }
      );
    }
    console.log('✅ 请求体大小检查通过:', contentLength, 'bytes');

    const collectionId = parseInt(params.id);
    console.log('📊 画集ID解析:', collectionId);
    
    // 🔍 新增：检查画集是否存在
    console.log('🔍 检查画集是否存在...');
    try {
      const collections = await collectionsDbService.getAllCollections(false); // 强制从数据库查询
      const targetCollection = collections.find(c => c.id === collectionId);
      
      if (!targetCollection) {
        console.error('❌ 画集不存在:', {
          requestedId: collectionId,
          existingIds: collections.map((c: any) => c.id)
        });
        return NextResponse.json(
          { error: `画集不存在 (ID: ${collectionId})，请刷新页面后重试` },
          { status: 404 }
        );
      }
      
      console.log('✅ 画集存在验证通过:', {
        id: targetCollection.id,
        title: targetCollection.title,
        artworkCount: targetCollection.pages.length
      });
    } catch (checkError) {
      console.error('❌ 检查画集存在性时发生错误:', checkError);
      return NextResponse.json(
        { error: '检查画集状态失败，请稍后重试' },
        { status: 500 }
      );
    }
    
    const artworkData = await request.json();
    console.log('📄 作品数据接收:', {
      title: artworkData.title,
      artist: artworkData.artist,
      fileId: artworkData.fileId || 'null',
      description: artworkData.description?.substring(0, 50) + '...'
    });
    
    // 强制使用通用文件服务，不再支持Base64图片
    if (!artworkData.fileId) {
      console.error('❌ 缺少fileId，必须使用通用文件服务上传图片');
      return NextResponse.json(
        { error: '必须使用文件服务上传图片，不支持Base64图片' },
        { status: 400 }
      );
    }
    
    console.log('💾 开始保存作品到数据库...');
    const artwork = await artworksDbService.addArtworkToCollection(collectionId, artworkData);
    
    console.log('✅ 作品保存成功:', {
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist
    });
    
    return NextResponse.json(artwork);
  } catch (error) {
    console.error('❌ 添加作品失败:', error);
    console.error('错误详情:', {
      message: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // 检查是否是外键约束错误
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      console.error('🚨 外键约束违反 - 画集可能已被删除');
      return NextResponse.json(
        { error: '画集不存在或已被删除，请刷新页面后重试' },
        { status: 409 }
      );
    }
    
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

    console.log('📋 [API] 获取作品列表:', { collectionId });
    const artworks = await artworksDbService.getArtworksByCollection(collectionId);
    console.log('📋 [API] 作品列表获取成功:', { 
      collectionId, 
      count: artworks.length,
      orders: artworks.map(a => ({ id: a.id, pageOrder: a.pageOrder }))
    });
    
    // 设置不缓存的响应头，确保总是返回最新数据
    const response = NextResponse.json(artworks);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('获取作品列表失败:', error);
    return NextResponse.json(
      { error: '获取作品列表失败' },
      { status: 500 }
    );
  }
} 