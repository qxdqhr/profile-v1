/**
 * 购买游戏购买操作API
 */

import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/modules/purchaseGame/services/gameService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: '商品ID不能为空' },
        { status: 400 }
      );
    }

    // 执行购买操作
    const response = await gameService.purchaseProduct(userId, productId);

    if (response.success) {
      return NextResponse.json(response);
    } else {
      return NextResponse.json(
        { error: response.error || '购买失败' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Purchase game purchase error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 