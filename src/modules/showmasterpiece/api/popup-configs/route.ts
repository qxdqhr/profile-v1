/**
 * ShowMasterpiece 模块 - 弹窗配置管理API
 * 
 * 提供弹窗配置的CRUD操作
 * 
 * @fileoverview 弹窗配置管理API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { popupConfigService } from '@/modules/showmasterpiece/popupConfigService';
import { isAdminUser, isAuthFailure, requireAdmin } from '../lib/auth';
import { apiError, apiFail, handleRouteError } from '../lib/response';
import { validateApiAuth } from '@/lib/auth/legacy';
type NewPopupConfig = any;

/**
 * GET - 获取弹窗配置列表
 * 完整列表仅管理员；`enabledOnly` + `businessScene` 可供前台拉取启用项
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessModule = searchParams.get('businessModule') || 'showmasterpiece';
    const businessScene = searchParams.get('businessScene') || undefined;
    const enabledOnly = searchParams.get('enabledOnly') === 'true';

    let configs;
    if (enabledOnly && businessScene) {
      configs = await popupConfigService.getEnabledPopupConfigs(businessModule, businessScene);
    } else {
      const user = await validateApiAuth(request);
      if (!isAdminUser(user)) {
        return apiError('需要管理员权限', 403);
      }
      configs = await popupConfigService.getAllPopupConfigs();
    }

    console.log(`✅ [API] 获取到 ${configs.length} 个弹窗配置`);

    return NextResponse.json({
      success: true,
      data: configs,
      count: configs.length,
    });

  } catch (error) {
    return handleRouteError(
      '❌ [API] 获取弹窗配置失败:',
      error,
      '获取弹窗配置失败',
      { data: [], count: 0 },
    );
  }
}

/**
 * POST - 创建弹窗配置
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthFailure(auth)) return auth;

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
      return apiFail('名称、触发配置和内容配置为必填项', 400);
    }

    // 创建配置数据
    const configData: Omit<NewPopupConfig, 'id' | 'createdAt' | 'updatedAt'> = {
      name: body.name,
      description: body.description,
      type: body.type || 'deadline',
      enabled: body.enabled ?? false,
      eventId: null,
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
    return handleRouteError('❌ [API] 创建弹窗配置失败:', error, '创建弹窗配置失败');
  }
}
