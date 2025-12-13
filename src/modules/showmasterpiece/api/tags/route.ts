import { NextRequest, NextResponse } from 'next/server';
import { tagsDbService } from '../../db/masterpiecesDbService';

// 强制动态渲染,避免构建时静态生成超时
export const dynamic = 'force-dynamic';
export const revalidate = false;
export const fetchCache = 'force-no-store';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventParam = searchParams.get('event') || undefined;

    console.log('📋 [标签API] 获取标签列表:', { eventParam });

    // 解析活动参数，获取eventId
    let eventId: number | null = null;
    if (eventParam) {
      try {
        const { EventService } = await import('../../services/eventService');
        const { eventId: resolvedEventId } = await EventService.resolveEvent(eventParam);
        eventId = resolvedEventId;
        console.log('🎯 [标签API] 解析活动:', { eventParam, eventId });
      } catch (error) {
        console.error('解析活动参数失败:', error);
        return NextResponse.json(
          { error: '无效的活动参数' },
          { status: 400 }
        );
      }
    }

    const tags = await tagsDbService.getTags(eventId);
    
    console.log(`✅ [标签API] 获取到 ${tags.length} 个标签`);
    
    return NextResponse.json({
      success: true,
      data: tags,
      total: tags.length
    });
  } catch (error) {
    console.error('获取标签失败:', error);
    return NextResponse.json(
      { error: '获取标签失败' },
      { status: 500 }
    );
  }
} 