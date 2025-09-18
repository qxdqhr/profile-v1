/**
 * ShowMasterpiece 模块 - 弹窗配置管理API
 * 
 * 提供弹窗配置的CRUD操作
 * 
 * @fileoverview 弹窗配置管理API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { popupConfigService } from '../../db/services/popupConfigService';
import { NewPopupConfig } from '../../db/schema/popupConfig';

/**
 * GET - 获取弹窗配置列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessModule = searchParams.get('businessModule') || 'showmasterpiece';
    const businessScene = searchParams.get('businessScene') || undefined;
    const enabledOnly = searchParams.get('enabledOnly') === 'true';
    const eventParam = searchParams.get('event') || undefined;

    console.log('📋 [API] 获取弹窗配置列表:', {
      businessModule,
      businessScene,
      enabledOnly,
      eventParam,
    });

    // 解析活动参数，获取eventId
    let eventId: number | null = null;
    if (eventParam) {
      try {
        const { EventService } = await import('../../services/eventService');
        const { eventId: resolvedEventId } = await EventService.resolveEvent(eventParam);
        eventId = resolvedEventId;
        console.log('🎯 [PopupConfigAPI] 解析活动:', { eventParam, eventId });
      } catch (error) {
        console.error('解析活动参数失败:', error);
        return NextResponse.json(
          {
            success: false,
            error: '无效的活动参数',
            details: error instanceof Error ? error.message : '活动参数解析失败',
          },
          { status: 400 }
        );
      }
    }

    let configs;
    if (enabledOnly && businessScene) {
      configs = await popupConfigService.getEnabledPopupConfigs(businessModule, businessScene, eventId);
    } else {
      configs = await popupConfigService.getAllPopupConfigs(eventId);
    }

    console.log(`✅ [API] 获取到 ${configs.length} 个弹窗配置`);

    return NextResponse.json({
      success: true,
      data: configs,
      count: configs.length,
    });

  } catch (error) {
    console.error('❌ [API] 获取弹窗配置失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '获取弹窗配置失败',
        details: error instanceof Error ? error.message : '未知错误',
        data: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}

/**
 * POST - 创建弹窗配置
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('➕ [API] 创建弹窗配置请求:', {
      name: body.name,
      type: body.type,
      businessModule: body.businessModule,
      businessScene: body.businessScene,
    });

    // 验证必填字段
    if (!body.name || !body.triggerConfig || !body.contentConfig) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必填字段',
          details: '名称、触发配置和内容配置为必填项',
        },
        { status: 400 }
      );
    }

    // 解析活动参数，获取eventId
    let eventId: number | null = null;
    if (body.eventParam) {
      try {
        const { EventService } = await import('../../services/eventService');
        const { eventId: resolvedEventId } = await EventService.resolveEvent(body.eventParam);
        eventId = resolvedEventId;
        console.log('🎯 [PopupConfigAPI] 解析活动:', { eventParam: body.eventParam, eventId });
      } catch (error) {
        console.error('解析活动参数失败:', error);
        return NextResponse.json(
          {
            success: false,
            error: '无效的活动参数',
            details: error instanceof Error ? error.message : '活动参数解析失败',
          },
          { status: 400 }
        );
      }
    } else if (body.eventId !== undefined) {
      // 向下兼容直接传递eventId的情况
      eventId = body.eventId;
    }

    // 创建配置数据
    const configData: Omit<NewPopupConfig, 'id' | 'createdAt' | 'updatedAt'> = {
      name: body.name,
      description: body.description,
      type: body.type || 'deadline',
      enabled: body.enabled ?? false,
      eventId: eventId,  // 使用解析后的eventId
      blockProcess: body.blockProcess ?? false,  // 添加 blockProcess 字段
      triggerConfig: body.triggerConfig,
      contentConfig: body.contentConfig,
      displayConfig: body.displayConfig,
      businessModule: body.businessModule || 'showmasterpiece',
      businessScene: body.businessScene || 'cart_checkout',
      sortOrder: body.sortOrder || '0',
    };

    const config = await popupConfigService.createPopupConfig(configData);

    console.log('✅ [API] 弹窗配置创建成功:', config.id);

    return NextResponse.json({
      success: true,
      data: config,
      message: '弹窗配置创建成功',
    });

  } catch (error) {
    console.error('❌ [API] 创建弹窗配置失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '创建弹窗配置失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
