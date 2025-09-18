/**
 * ShowMasterpiece 模块 - 弹窗配置检查API
 * 
 * 检查是否需要显示弹窗
 * 
 * @fileoverview 弹窗配置检查API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { popupConfigService } from '../../../db/services/popupConfigService';

/**
 * POST - 检查是否需要显示弹窗
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      businessModule = 'showmasterpiece', 
      businessScene = 'cart_checkout',
      currentTime,
      eventParam
    } = body;

    console.log('🔔 [API] 检查弹窗配置请求:', {
      businessModule,
      businessScene,
      currentTime,
      eventParam,
      timestamp: new Date().toISOString()
    });

    // 解析活动参数，获取eventId
    let eventId: number | null = null;
    if (eventParam) {
      try {
        const { EventService } = await import('../../../services/eventService');
        const { eventId: resolvedEventId } = await EventService.resolveEvent(eventParam);
        eventId = resolvedEventId;
        console.log('🎯 [PopupAPI] 解析活动:', { eventParam, eventId });
      } catch (error) {
        console.error('解析活动参数失败:', error);
        // 如果活动参数无效，返回错误
        return NextResponse.json(
          {
            success: false,
            error: '无效的活动参数',
            details: error instanceof Error ? error.message : '活动参数解析失败',
            configs: [],
            count: 0,
          },
          { status: 400 }
        );
      }
    }
    // 如果没有eventParam，eventId保持为null，表示查询通用弹窗

    // 解析当前时间
    const checkTime = currentTime ? new Date(currentTime) : new Date();
    
    // 检查是否需要显示弹窗（传递eventId进行过滤）
    const triggeredConfigs = await popupConfigService.shouldShowPopup(
      businessModule,
      businessScene,
      checkTime,
      eventId
    );

    console.log(`✅ [API] 弹窗检查完成，找到 ${triggeredConfigs.length} 个需要显示的弹窗`);

    return NextResponse.json({
      success: true,
      configs: triggeredConfigs,
      checkTime: checkTime.toISOString(),
      count: triggeredConfigs.length,
    });

  } catch (error) {
    console.error('❌ [API] 检查弹窗配置失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '检查弹窗配置失败',
        details: error instanceof Error ? error.message : '未知错误',
        configs: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
