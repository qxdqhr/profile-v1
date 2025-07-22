/**
 * ShowMasterpiece 模块 - 购物车API路由
 * 
 * 处理购物车相关的HTTP请求，包括：
 * - GET: 获取购物车数据
 * 
 * @fileoverview 购物车API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { CartDbService } from '@/modules/showmasterpiece/services/cartDbService';

/**
 * 获取购物车数据
 * 
 * @param request Next.js请求对象
 * @returns 购物车数据
 */
async function GET(request: NextRequest) {
  try {
    // 从请求头或查询参数中获取用户ID
    // 这里暂时使用查询参数，实际应该从认证中间件获取
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: '缺少用户ID' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { message: '用户ID格式错误' },
        { status: 400 }
      );
    }

    // 获取或创建用户的购物车
    const cart = await CartDbService.getOrCreateCart(userIdNum);
    
    // 获取购物车中的商品项
    const cartItems = await CartDbService.getCartItems(cart.id);
    
    // 计算总数量和总价格
    let totalQuantity = 0;
    let totalPrice = 0;
    
    cartItems.forEach(item => {
      totalQuantity += item.quantity;
      // 这里可以根据实际需求计算价格
      totalPrice += 0; // 暂时设为0，因为没有价格字段
    });

    const cartData = {
      id: cart.id,
      items: cartItems.map(item => ({
        collectionId: item.collectionId,
        collection: item.collection,
        quantity: item.quantity,
        addedAt: item.addedAt
      })),
      totalQuantity,
      totalPrice
    };

    return NextResponse.json(cartData);
  } catch (error) {
    console.error('获取购物车失败:', error);
    return NextResponse.json(
      { message: '获取购物车失败' },
      { status: 500 }
    );
  }
}

export { GET }; 