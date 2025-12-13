import { NextRequest, NextResponse } from 'next/server';
import { categoriesDbService } from '../../db/masterpiecesDbService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventParam = searchParams.get('event') || undefined;

    console.log('📋 [分类API] 获取分类列表:', { eventParam });

    // 解析活动参数，获取eventId
    let eventId: number | null = null;
    if (eventParam) {
      try {
        const { EventService } = await import('../../services/eventService');
        const { eventId: resolvedEventId } = await EventService.resolveEvent(eventParam);
        eventId = resolvedEventId;
        console.log('🎯 [分类API] 解析活动:', { eventParam, eventId });
      } catch (error) {
        console.error('解析活动参数失败:', error);
        return NextResponse.json(
          { error: '无效的活动参数' },
          { status: 400 }
        );
      }
    }

    const categories = await categoriesDbService.getCategories(eventId);
    
    console.log(`✅ [分类API] 获取到 ${categories.length} 个分类`);
    
    return NextResponse.json({
      success: true,
      data: categories,
      total: categories.length
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    );
  }
} 