/**
 * ShowMasterpiece — 单个弹窗配置（管理员）
 */

import { NextRequest, NextResponse } from 'next/server';
import { popupConfigService } from '@profile/showmasterpiece-core/popupConfigService';
import { isAuthFailure, requireAdmin } from '../../lib/auth';
import { apiFail, apiOk, handleRouteError } from '../../lib/response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(_request);
  if (isAuthFailure(auth)) return auth;

  try {
    const { id } = await params;
    const config = await popupConfigService.getPopupConfigById(id);

    if (!config) {
      return apiFail('弹窗配置不存在', 404);
    }

    return apiOk(config);
  } catch (error) {
    return handleRouteError('❌ [API] 获取弹窗配置失败:', error, '获取弹窗配置失败');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    const fields = [
      'name',
      'description',
      'type',
      'enabled',
      'blockProcess',
      'triggerConfig',
      'contentConfig',
      'displayConfig',
      'businessModule',
      'businessScene',
      'sortOrder',
    ] as const;

    for (const key of fields) {
      if (key in body) updateData[key] = body[key];
    }

    if (Object.keys(updateData).length === 0) {
      return apiFail('没有提供要更新的字段', 400);
    }

    const config = await popupConfigService.updatePopupConfig(id, updateData);

    return NextResponse.json({
      success: true,
      data: config,
      message: '弹窗配置更新成功',
    });
  } catch (error) {
    return handleRouteError('❌ [API] 更新弹窗配置失败:', error, '更新弹窗配置失败');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const { id } = await params;
    await popupConfigService.deletePopupConfig(id);

    return NextResponse.json({
      success: true,
      message: '弹窗配置删除成功',
    });
  } catch (error) {
    return handleRouteError('❌ [API] 删除弹窗配置失败:', error, '删除弹窗配置失败');
  }
}
