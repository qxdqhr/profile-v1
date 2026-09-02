import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser, isAdminRole } from '@/lib/auth/session';
import { mmdModelsDbService } from '../../../server';
import type { ApiResponse, MMDModel } from '../../../types';

function canMutateModel(
  user: { id: string | number; role?: string | null },
  model: MMDModel,
): boolean {
  if (isAdminRole(user.role)) return true;
  if (model.userId == null) return true;
  return String(model.userId) === String(user.id);
}

/**
 * GET /api/mmd/models/[id]
 * 获取单个MMD模型详情（公开模型免登录；私有模型需本人或管理员）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const modelId = parseInt(id, 10);

    if (Number.isNaN(modelId)) {
      const response: ApiResponse = {
        success: false,
        error: '无效的模型ID',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const model = await mmdModelsDbService.getModelById(modelId);

    if (!model) {
      const response: ApiResponse = {
        success: false,
        error: '模型不存在',
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (!model.isPublic) {
      const user = await getApiSessionUser(request);
      if (!user || !canMutateModel(user, model)) {
        return NextResponse.json(
          { success: false, error: '未授权的访问' } satisfies ApiResponse,
          { status: 401 },
        );
      }
    }

    const response: ApiResponse<MMDModel> = {
      success: true,
      data: model,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to get model:', error);

    const response: ApiResponse = {
      success: false,
      error: '获取模型详情失败',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/mmd/models/[id]
 * 更新MMD模型信息
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '未授权的访问' } satisfies ApiResponse,
        { status: 401 },
      );
    }

    const { id } = await params;
    const modelId = parseInt(id, 10);

    if (Number.isNaN(modelId)) {
      const response: ApiResponse = {
        success: false,
        error: '无效的模型ID',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const existing = await mmdModelsDbService.getModelById(modelId);
    if (!existing) {
      const response: ApiResponse = {
        success: false,
        error: '模型不存在',
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (!canMutateModel(user, existing)) {
      return NextResponse.json(
        { success: false, error: '无权修改该模型' } satisfies ApiResponse,
        { status: 403 },
      );
    }

    const body = await request.json();
    const updateData = { ...body };

    delete updateData.id;
    delete updateData.uploadTime;
    delete updateData.downloadCount;
    delete updateData.userId;

    const model = await mmdModelsDbService.updateModel(modelId, updateData);

    if (!model) {
      const response: ApiResponse = {
        success: false,
        error: '模型不存在',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<MMDModel> = {
      success: true,
      data: model,
      message: '模型更新成功',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update model:', error);

    const response: ApiResponse = {
      success: false,
      error: '更新模型失败',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/mmd/models/[id]
 * 删除MMD模型
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '未授权的访问' } satisfies ApiResponse,
        { status: 401 },
      );
    }

    const { id } = await params;
    const modelId = parseInt(id, 10);

    if (Number.isNaN(modelId)) {
      const response: ApiResponse = {
        success: false,
        error: '无效的模型ID',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const existing = await mmdModelsDbService.getModelById(modelId);
    if (!existing) {
      const response: ApiResponse = {
        success: false,
        error: '模型不存在',
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (!canMutateModel(user, existing)) {
      return NextResponse.json(
        { success: false, error: '无权删除该模型' } satisfies ApiResponse,
        { status: 403 },
      );
    }

    const success = await mmdModelsDbService.deleteModel(modelId);

    if (!success) {
      const response: ApiResponse = {
        success: false,
        error: '模型不存在',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: '模型删除成功',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete model:', error);

    const response: ApiResponse = {
      success: false,
      error: '删除模型失败',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
