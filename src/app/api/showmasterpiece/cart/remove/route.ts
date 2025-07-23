/**
 * ShowMasterpiece 模块 - 移除购物车商品API路由
 * 
 * 处理从购物车移除商品的HTTP请求
 * 
 * @fileoverview 移除购物车商品API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { CartDbService } from '@/modules/showmasterpiece/services/cartDbService';

/**
 * 从购物车移除商品
 * 
 * @param request Next.js请求对象
 * @returns 更新后的购物车数据
 */
async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, collectionId } = body;

    // 数据验证
    if (!userId || !collectionId) {
      return NextResponse.json(
        { message: '缺少必要参数：用户ID、画集ID' },
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

    // 从购物车移除商品
    await CartDbService.removeItemFromCart(cart.id, collectionId);
    
    // 获取更新后的购物车数据
    const cartItems = await CartDbService.getCartItems(cart.id);
    
    // 计算总数量和总价格
    let totalQuantity = 0;
    let totalPrice = 0;
    
    cartItems.forEach(item => {
      totalQuantity += item.quantity;
      // 计算价格：数量 × 画集价格（如果价格为null则按0计算）
      const itemPrice = (item.collection.price || 0) * item.quantity;
      totalPrice += itemPrice;
    });

    const updatedCart = {
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

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error('移除购物车商品失败:', error);
    return NextResponse.json(
      { message: '移除购物车商品失败' },
      { status: 500 }
    );
  }
}

export { DELETE }; 