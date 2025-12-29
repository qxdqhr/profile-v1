/**
 * ShowMasterpiece 模块 - 单个弹窗配置管理API
 * 
 * 提供单个弹窗配置的查看、更新、删除操作
 * 
 * @fileoverview 单个弹窗配置管理API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { popupConfigService } from '../../../db/services/popupConfigService';

/**
 * GET - 获取单个弹窗配置
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = params;

    console.log('📋 [API] 获取弹窗配置详情:', id);

    const config = await popupConfigService.getPopupConfigById(id);
    
    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: '弹窗配置不存在',
        },
        { status: 404 }
      );
    }

    console.log('✅ [API] 弹窗配置获取成功:', config.id);

    return NextResponse.json({
      success: true,
      data: config,
    });

  } catch (error) {
    console.error('❌ [API] 获取弹窗配置失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '获取弹窗配置失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - 更新弹窗配置
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = params;
    const body = await request.json();

    console.log('✏️ [API] 更新弹窗配置请求:', {
      id,
      name: body.name,
      enabled: body.enabled,
    });

    // 构建更新数据
    const updateData: any = {};
    
    if ('name' in body) updateData.name = body.name;
    if ('description' in body) updateData.description = body.description;
    if ('type' in body) updateData.type = body.type;
    if ('enabled' in body) updateData.enabled = body.enabled;
    if ('blockProcess' in body) updateData.blockProcess = body.blockProcess;  // 添加 blockProcess 字段
    if ('triggerConfig' in body) updateData.triggerConfig = body.triggerConfig;
    if ('contentConfig' in body) updateData.contentConfig = body.contentConfig;
    if ('displayConfig' in body) updateData.displayConfig = body.displayConfig;
    if ('businessModule' in body) updateData.businessModule = body.businessModule;
    if ('businessScene' in body) updateData.businessScene = body.businessScene;
    if ('sortOrder' in body) updateData.sortOrder = body.sortOrder;

    const config = await popupConfigService.updatePopupConfig(id, updateData);

    console.log('✅ [API] 弹窗配置更新成功:', config.id);

    return NextResponse.json({
      success: true,
      data: config,
      message: '弹窗配置更新成功',
    });

  } catch (error) {
    console.error('❌ [API] 更新弹窗配置失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '更新弹窗配置失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - 删除弹窗配置
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = params;

    console.log('🗑️ [API] 删除弹窗配置请求:', id);

    await popupConfigService.deletePopupConfig(id);

    console.log('✅ [API] 弹窗配置删除成功:', id);

    return NextResponse.json({
      success: true,
      message: '弹窗配置删除成功',
    });

  } catch (error) {
    console.error('❌ [API] 删除弹窗配置失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '删除弹窗配置失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
