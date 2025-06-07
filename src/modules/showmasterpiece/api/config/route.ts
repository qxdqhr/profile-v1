import { NextRequest, NextResponse } from 'next/server';
import { masterpiecesConfigDbService } from '../../db/masterpiecesDbService';
import { validateApiAuth } from '@/modules/auth/server';

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
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
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
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    await masterpiecesConfigDbService.resetConfig();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('重置配置失败:', error);
    return NextResponse.json(
      { error: '重置配置失败' },
      { status: 500 }
    );
  }
} 