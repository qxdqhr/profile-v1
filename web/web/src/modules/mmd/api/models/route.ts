import { NextRequest, NextResponse } from 'next/server';
import { mmdModelsDbService } from '../../server';
import type { ApiResponse, MMDModel } from '../../types';

/**
 * GET /api/mmd/models
 * 获取MMD模型列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const query = searchParams.get('query');

    let models: MMDModel[];

    if (query) {
      // 搜索模型
      models = await mmdModelsDbService.searchModels(
        query, 
        userId ? parseInt(userId) : undefined
      );
    } else if (userId) {
      // 获取用户的模型
      models = await mmdModelsDbService.getUserModels(parseInt(userId));
    } else {
      // 获取公开模型
      models = await mmdModelsDbService.getPublicModels();
    }

    const response: ApiResponse<MMDModel[]> = {
      success: true,
      data: models,
      message: `成功获取 ${models.length} 个模型`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to get models:', error);
    
    const response: ApiResponse = {
      success: false,
      error: '获取模型列表失败',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/mmd/models
 * 创建新的MMD模型记录
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      filePath,
      thumbnailPath,
      fileSize,
      format,
      userId,
      tags,
      isPublic,
    } = body;

    // 验证必填字段
    if (!name || !filePath || !fileSize || !format) {
      const response: ApiResponse = {
        success: false,
        error: '缺少必填字段：name, filePath, fileSize, format',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 验证格式
    if (!['pmd', 'pmx'].includes(format)) {
      const response: ApiResponse = {
        success: false,
        error: '不支持的模型格式，仅支持 pmd 和 pmx',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const model = await mmdModelsDbService.createModel({
      name,
      description,
      filePath,
      thumbnailPath,
      fileSize: parseInt(fileSize),
      format,
      userId: userId ? parseInt(userId) : undefined,
      tags: Array.isArray(tags) ? tags : [],
      isPublic: Boolean(isPublic),
    });

    const response: ApiResponse<MMDModel> = {
      success: true,
      data: model,
      message: '模型创建成功',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Failed to create model:', error);
    
    const response: ApiResponse = {
      success: false,
      error: '创建模型失败',
    };

    return NextResponse.json(response, { status: 500 });
  }
} 