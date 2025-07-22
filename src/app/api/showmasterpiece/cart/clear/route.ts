/**
 * ShowMasterpiece 模块 - 清空购物车API路由
 * 
 * 处理清空购物车的HTTP请求
 * 
 * @fileoverview 清空购物车API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { CartDbService } from '@/modules/showmasterpiece/services/cartDbService';

/**
 * 清空购物车
 * 
 * @param request Next.js请求对象
 * @returns 清空后的购物车数据
 */
async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    // 数据验证
    if (!userId) {
      return NextResponse.json(
        { message: '缺少必要参数：用户ID' },
        { status: 400 }
      );
    }

    // 获取用户的购物车
    const cart = await CartDbService.getActiveCart(userId);
    
    if (!cart) {
      return NextResponse.json(
        { message: '购物车不存在' },
        { status: 404 }
      );
    }

    // 清空购物车
    await CartDbService.clearCart(cart.id);
    
    // 返回空的购物车数据
    const emptyCart = {
      id: cart.id,
      items: [],
      totalQuantity: 0,
      totalPrice: 0
    };

    return NextResponse.json(emptyCart);
  } catch (error) {
    console.error('清空购物车失败:', error);
    return NextResponse.json(
      { message: '清空购物车失败' },
      { status: 500 }
    );
  }
}

export { DELETE }; 