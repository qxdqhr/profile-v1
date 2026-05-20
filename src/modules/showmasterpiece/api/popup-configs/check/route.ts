/**
 * ShowMasterpiece — 弹窗触发检查（公开，供结账流程调用）
 */

import { NextRequest } from 'next/server';
import { popupConfigService } from '@/modules/showmasterpiece/popupConfigService';
import { apiFail, apiOk, handleRouteError } from '../../lib/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessModule = 'showmasterpiece',
      businessScene = 'cart_checkout',
      currentTime,
    } = body;

    const checkTime = currentTime ? new Date(currentTime) : new Date();

    const triggeredConfigs = await popupConfigService.shouldShowPopup(
      businessModule,
      businessScene,
      checkTime,
    );

    return apiOk(triggeredConfigs, {
      configs: triggeredConfigs,
      checkTime: checkTime.toISOString(),
      count: triggeredConfigs.length,
    });
  } catch (error) {
    return handleRouteError(
      '❌ [API] 检查弹窗配置失败:',
      error,
      '检查弹窗配置失败',
      { configs: [], count: 0 },
    );
  }
}
