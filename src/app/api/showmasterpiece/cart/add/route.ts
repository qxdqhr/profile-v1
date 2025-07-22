/**
 * ShowMasterpiece 模块 - 添加到购物车API路由
 * 
 * 处理添加到购物车的HTTP请求
 * 
 * @fileoverview 添加到购物车API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { CartDbService } from '@/modules/showmasterpiece/services/cartDbService';
import { db } from '@/db';
import { comicUniverseCollections } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 添加商品到购物车
 * 
 * @param request Next.js请求对象
 * @returns 更新后的购物车数据
 */
async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, collectionId, quantity } = body;

    // 数据验证
    if (!userId || !collectionId || !quantity) {
      return NextResponse.json(
        { message: '缺少必要参数：用户ID、画集ID、数量' },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { message: '数量必须大于0' },
        { status: 400 }
      );
    }

    // 检查画集是否存在
    const collection = await db
      .select()
      .from(comicUniverseCollections)
      .where(eq(comicUniverseCollections.id, collectionId))
      .limit(1);

    if (collection.length === 0) {
      return NextResponse.json(
        { message: '画集不存在' },
        { status: 404 }
      );
    }

    // 获取或创建用户的购物车
    const cart = await CartDbService.getOrCreateCart(userId);
    
    // 添加商品到购物车
    await CartDbService.addItemToCart(cart.id, collectionId, quantity);
    
    // 获取更新后的购物车数据
    const cartItems = await CartDbService.getCartItems(cart.id);
    
    // 计算总数量和总价格
    let totalQuantity = 0;
    let totalPrice = 0;
    
    cartItems.forEach(item => {
      totalQuantity += item.quantity;
      // 这里可以根据实际需求计算价格
      totalPrice += 0; // 暂时设为0，因为没有价格字段
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

    return NextResponse.json(updatedCart, { status: 201 });
  } catch (error) {
    console.error('添加到购物车失败:', error);
    return NextResponse.json(
      { message: '添加到购物车失败' },
      { status: 500 }
    );
  }
}

export { POST }; 