/**
 * 购买游戏初始化API
 */

import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/modules/purchaseGame/services/gameService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    // 初始化游戏
    const response = await gameService.initGame(userId);

    if (response.success) {
      return NextResponse.json(response);
    } else {
      return NextResponse.json(
        { error: response.message || '游戏初始化失败' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Purchase game init error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 