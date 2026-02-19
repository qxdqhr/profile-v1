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
      currentTime
    } = body;

    console.log('🔔 [API] 检查弹窗配置请求:', {
      businessModule,
      businessScene,
      currentTime,
      timestamp: new Date().toISOString()
    });

    // 解析当前时间
    const checkTime = currentTime ? new Date(currentTime) : new Date();
    
    // 检查是否需要显示弹窗
    const triggeredConfigs = await popupConfigService.shouldShowPopup(
      businessModule,
      businessScene,
      checkTime
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
