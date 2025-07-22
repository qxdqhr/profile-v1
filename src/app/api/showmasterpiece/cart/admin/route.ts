/**
 * ShowMasterpiece 模块 - 购物车管理API路由
 * 
 * 管理员获取所有用户的购物车数据
 * 
 * @fileoverview 购物车管理API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { CartDbService } from '@/modules/showmasterpiece/services/cartDbService';
import { db } from '@/db';
import { comicUniverseCarts, comicUniverseCartItems, comicUniverseCollections, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * 获取所有用户的购物车数据（管理员专用）
 * 
 * @param request Next.js请求对象
 * @returns 所有用户的购物车数据
 */
async function GET(request: NextRequest) {
  try {
    // 这里应该添加管理员权限验证
    // 暂时跳过权限验证，实际使用时需要添加
    
    // 获取所有活跃的购物车
    const allCarts = await db
      .select({
        id: comicUniverseCarts.id,
        userId: comicUniverseCarts.userId,
        status: comicUniverseCarts.status,
        isExpired: comicUniverseCarts.isExpired,
        expiresAt: comicUniverseCarts.expiresAt,
        createdAt: comicUniverseCarts.createdAt,
        updatedAt: comicUniverseCarts.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
        }
      })
      .from(comicUniverseCarts)
      .leftJoin(users, eq(comicUniverseCarts.userId, users.id))
      .orderBy(desc(comicUniverseCarts.updatedAt));

    // 获取所有购物车项
    const allCartItems = await db
      .select({
        id: comicUniverseCartItems.id,
        cartId: comicUniverseCartItems.cartId,
        collectionId: comicUniverseCartItems.collectionId,
        quantity: comicUniverseCartItems.quantity,
        addedAt: comicUniverseCartItems.addedAt,
        updatedAt: comicUniverseCartItems.updatedAt,
        collection: {
          id: comicUniverseCollections.id,
          title: comicUniverseCollections.title,
          artist: comicUniverseCollections.artist,
          coverImage: comicUniverseCollections.coverImage,
        }
      })
      .from(comicUniverseCartItems)
      .innerJoin(comicUniverseCollections, eq(comicUniverseCartItems.collectionId, comicUniverseCollections.id))
      .orderBy(desc(comicUniverseCartItems.addedAt));

    // 组织数据结构
    const cartsWithItems = allCarts.map(cart => {
      const items = allCartItems.filter(item => item.cartId === cart.id);
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + ((item.collection as any).price || 0) * item.quantity, 0);
      
      return {
        ...cart,
        items,
        totalQuantity,
        totalPrice,
        itemCount: items.length
      };
    });

    // 计算统计信息
    const stats = {
      totalCarts: cartsWithItems.length,
      activeCarts: cartsWithItems.filter(cart => cart.status === 'active' && !cart.isExpired).length,
      convertedCarts: cartsWithItems.filter(cart => cart.status === 'converted').length,
      abandonedCarts: cartsWithItems.filter(cart => cart.status === 'abandoned').length,
      expiredCarts: cartsWithItems.filter(cart => cart.isExpired).length,
      totalItems: allCartItems.length,
      totalQuantity: allCartItems.reduce((sum, item) => sum + item.quantity, 0),
    };

    return NextResponse.json({
      carts: cartsWithItems,
      stats
    });
  } catch (error) {
    console.error('获取购物车管理数据失败:', error);
    return NextResponse.json(
      { message: '获取购物车管理数据失败' },
      { status: 500 }
    );
  }
}

export { GET }; 