import { NextRequest, NextResponse } from 'next/server';
import { MMDModelsDbService } from '@/modules/mmd/db/mmdDbService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: '模型ID不能为空' },
        { status: 400 }
      );
    }

    const modelService = new MMDModelsDbService();
    const model = await modelService.getModelById(parseInt(id));

    if (!model) {
      return NextResponse.json(
        { error: '模型不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(model);

  } catch (error) {
    console.error('获取模型信息错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 