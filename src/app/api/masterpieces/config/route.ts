import { NextRequest, NextResponse } from 'next/server';
import { masterpiecesConfigDbService } from '@/db/services/masterpiecesDbService';
import { validateApiAuth, createUnauthorizedResponse } from '@/utils/authUtils';

export async function GET() {
  try {
    const config = await masterpiecesConfigDbService.getConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      const { error, status } = createUnauthorizedResponse();
      return NextResponse.json({ error }, { status });
    }

    const configData = await request.json();
    const updatedConfig = await masterpiecesConfigDbService.updateConfig(configData);
    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('更新配置失败:', error);
    return NextResponse.json(
      { error: '更新配置失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      const { error, status } = createUnauthorizedResponse();
      return NextResponse.json({ error }, { status });
    }

    const resetConfig = await masterpiecesConfigDbService.resetConfig();
    return NextResponse.json(resetConfig);
  } catch (error) {
    console.error('重置配置失败:', error);
    return NextResponse.json(
      { error: '重置配置失败' },
      { status: 500 }
    );
  }
} 