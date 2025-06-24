import { NextRequest, NextResponse } from 'next/server';
import { mmdModelsDbService } from '../../../server';
import type { ApiResponse, MMDModel } from '../../../types';

/**
 * GET /api/mmd/models/[id]
 * 获取单个MMD模型详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modelId = parseInt(params.id);
    
    if (isNaN(modelId)) {
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
  { params }: { params: { id: string } }
) {
  try {
    const modelId = parseInt(params.id);
    
    if (isNaN(modelId)) {
      const response: ApiResponse = {
        success: false,
        error: '无效的模型ID',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();
    const updateData = { ...body };

    // 移除不应该更新的字段
    delete updateData.id;
    delete updateData.uploadTime;
    delete updateData.downloadCount;

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
  { params }: { params: { id: string } }
) {
  try {
    const modelId = parseInt(params.id);
    
    if (isNaN(modelId)) {
      const response: ApiResponse = {
        success: false,
        error: '无效的模型ID',
      };
      return NextResponse.json(response, { status: 400 });
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