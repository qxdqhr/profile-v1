import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { mmdModelsDbService } from '../../server';
import type { ApiResponse, MMDModel } from '../../types';

/**
 * GET /api/mmd/models
 * 获取MMD模型列表（公开列表免登录；按 userId 查询需本人登录）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const query = searchParams.get('query');

    let models: MMDModel[];

    if (userId) {
      const user = await getApiSessionUser(request);
      if (!user) {
        return NextResponse.json(
          { success: false, error: '未授权的访问' } satisfies ApiResponse,
          { status: 401 },
        );
      }
      const requestedUserId = userId;
      if (String(user.id) !== requestedUserId) {
        return NextResponse.json(
          { success: false, error: '无权查看该用户的模型' } satisfies ApiResponse,
          { status: 403 },
        );
      }
    }

    if (query) {
      models = await mmdModelsDbService.searchModels(
        query,
        userId ? userId : undefined,
      );
    } else if (userId) {
      models = await mmdModelsDbService.getUserModels(userId);
    } else {
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
    const user = await getApiSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '未授权的访问' } satisfies ApiResponse,
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      filePath,
      thumbnailPath,
      fileSize,
      format,
      tags,
      isPublic,
    } = body;

    if (!name || !filePath || !fileSize || !format) {
      const response: ApiResponse = {
        success: false,
        error: '缺少必填字段：name, filePath, fileSize, format',
      };
      return NextResponse.json(response, { status: 400 });
    }

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
      fileSize: parseInt(fileSize, 10),
      format,
      userId: String(user.id),
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
