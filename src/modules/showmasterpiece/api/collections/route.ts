import { NextRequest, NextResponse } from 'next/server';
import { collectionsDbService } from '../../db/masterpiecesDbService';
import { eventAwareCollectionsService } from '../../services/eventAwareCollectionsService';
import { validateApiAuth } from '@/modules/auth/server';

/**
 * 获取画集列表
 * GET /api/masterpieces/collections
 * 
 * 查询参数:
 * - overview: boolean - 是否只获取概览信息（不包含作品详情）
 * - event: string - 活动标识符或ID，指定获取特定活动的画集（默认为第一期活动）
 * 
 * 性能优化策略:
 * 1. 支持overview模式，只获取基本信息，不加载作品详情
 * 2. 使用内存缓存（2分钟有效期）
 * 3. 并行查询优化（分类、标签、作品数据并行获取）
 * 4. HTTP缓存头设置（2分钟强缓存 + 5分钟过期重验证）
 * 5. 支持活动参数，实现多期活动数据隔离
 */
export async function GET(request: NextRequest) {
  try {
    // 尝试验证用户权限，但不强制要求
    const user = await validateApiAuth(request);
    console.log('🔐 [collections] 用户认证状态:', user ? '已登录' : '未登录');

    const searchParams = request.nextUrl.searchParams;
    const overview = searchParams.get('overview') === 'true';
    const nocache = searchParams.get('nocache') === 'true'; // 检查是否强制不使用缓存
    const includeImages = searchParams.get('includeImages') === 'true'; // 检查是否包含图片数据
    const eventParam = searchParams.get('event') || undefined; // 活动参数：可以是ID或slug
    
    console.log('📋 [collections] 获取画集列表参数:', { overview, nocache, includeImages, eventParam });
    
    // 如果请求overview，返回不包含作品详情的快速响应
    // 这种模式适用于首页展示、列表页等场景，大幅提升加载速度
    if (overview) {
      const collectionsOverview = await eventAwareCollectionsService.getCollectionsOverview(eventParam);
      
      // 设置缓存头 - 客户端缓存2分钟，过期后可重验证5分钟
      const response = NextResponse.json({
        success: true,
        data: collectionsOverview,
        total: collectionsOverview.length
      });
      response.headers.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
      return response;
    }
    
    // 完整的画集数据（包含所有作品）
    // 这种模式适用于详情页、编辑页等需要完整数据的场景
    const collections = await eventAwareCollectionsService.getAllCollections(!nocache, eventParam); // 传递缓存参数和活动参数
    
    // 设置不缓存的响应头
    const response = NextResponse.json({
      success: true,
      data: collections,
      total: collections.length
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
  } catch (error) {
    console.error('获取画集列表失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取画集列表失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

/**
 * 创建新画集
 * POST /api/masterpieces/collections
 * 
 * 权限要求: 需要用户登录认证
 * 
 * 请求体限制:
 * - 最大10MB，防止大图片上传导致服务器压力
 * 
 * 操作流程:
 * 1. 用户权限验证
 * 2. 请求体大小检查
 * 3. 创建画集（包括分类和标签处理）
 * 4. 清除缓存确保数据一致性
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户权限 - 只有登录用户才能创建画集
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    // 检查请求体大小 - 防止大文件上传影响服务器性能
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB 限制
      return NextResponse.json(
        { error: '请求数据太大，请压缩图片后重试' },
        { status: 413 }
      );
    }

    const requestBody = await request.json();
    const { eventParam, ...collectionData } = requestBody;
    
    // 解析活动参数，获取eventId
    let eventId: number | null = null;
    if (eventParam) {
      const { EventService } = await import('../../services/eventService');
      const { eventId: resolvedEventId } = await EventService.resolveEvent(eventParam);
      eventId = resolvedEventId;
    }
    
    console.log('🎨 [创建画集] 活动信息:', { eventParam, eventId });
    
    const newCollection = await collectionsDbService.createCollection(collectionData, eventId ?? undefined);
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

/**
 * 批量更新画集操作
 * PATCH /api/masterpieces/collections
 * 
 * 权限要求: 需要用户登录认证
 * 
 * 支持的操作类型（通过action查询参数指定）:
 * - reorder: 批量重排序多个画集
 * - move: 移动单个画集到指定位置
 * - up: 单个画集上移一位
 * - down: 单个画集下移一位
 * 
 * 性能优化:
 * 1. 使用数据库事务确保操作原子性
 * 2. 批量更新减少数据库交互次数
 * 3. 操作完成后清除缓存
 */
export async function PATCH(request: NextRequest) {
  try {
    // 验证用户权限 - 只有登录用户才能修改画集顺序
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    
    if (action === 'reorder') {
      // 批量重排序 - 适用于拖拽排序等场景
      const { collectionOrders } = await request.json();
      
      // 数据验证 - 确保传入的数据格式正确
      if (!Array.isArray(collectionOrders) || 
          !collectionOrders.every(item => 
            typeof item.id === 'number' && 
            typeof item.displayOrder === 'number'
          )) {
        return NextResponse.json(
          { error: '无效的排序数据格式' },
          { status: 400 }
        );
      }

      await collectionsDbService.updateCollectionOrder(collectionOrders);
      
      return NextResponse.json({ success: true, message: '画集顺序已更新' });
    }
    
    if (action === 'move') {
      // 移动到指定位置 - 精确位置控制
      const { collectionId, targetOrder } = await request.json();
      
      if (typeof collectionId !== 'number' || typeof targetOrder !== 'number') {
        return NextResponse.json(
          { error: '无效的移动参数' },
          { status: 400 }
        );
      }

      await collectionsDbService.moveCollection(collectionId, targetOrder);
      
      return NextResponse.json({ success: true, message: '画集位置已更新' });
    }
    
    if (action === 'up') {
      // 上移一位 - 简单的位置调整
      const { collectionId } = await request.json();
      
      if (typeof collectionId !== 'number') {
        return NextResponse.json(
          { error: '无效的画集ID' },
          { status: 400 }
        );
      }

      await collectionsDbService.moveCollectionUp(collectionId);
      
      return NextResponse.json({ success: true, message: '画集已上移' });
    }
    
    if (action === 'down') {
      // 下移一位 - 简单的位置调整
      const { collectionId } = await request.json();
      
      if (typeof collectionId !== 'number') {
        return NextResponse.json(
          { error: '无效的画集ID' },
          { status: 400 }
        );
      }

      await collectionsDbService.moveCollectionDown(collectionId);
      
      return NextResponse.json({ success: true, message: '画集已下移' });
    }
    
    return NextResponse.json(
      { error: '不支持的操作类型' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('画集排序操作失败:', error);
    
    // 根据错误类型返回适当的状态码和错误信息
    const errorMessage = error instanceof Error ? error.message : '操作失败';
    
    // 检查是否是边界条件错误（已在最前/最后位置）
    if (errorMessage.includes('已经在最前面') || errorMessage.includes('已经在最后面') || 
        errorMessage.includes('已经在最顶部') || errorMessage.includes('已经在最底部')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 409 } // Conflict - 冲突状态
      );
    }
    
    // 检查是否是资源不存在错误
    if (errorMessage.includes('不存在') || errorMessage.includes('无效')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 } // Not Found
      );
    }
    
    // 其他服务器内部错误
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 