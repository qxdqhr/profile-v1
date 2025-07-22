/**
 * ShowMasterpiece 模块 - 购物车数据库服务
 * 
 * 提供购物车相关的数据库操作服务，包括：
 * - 购物车CRUD操作
 * - 购物车项管理
 * - 购物车状态管理
 * 
 * @fileoverview 购物车数据库服务
 */

import { db } from '@/db';
import { 
  comicUniverseCarts, 
  comicUniverseCartItems,
  comicUniverseCollections,
  type ComicUniverseCart,
  type NewComicUniverseCart,
  type ComicUniverseCartItem,
  type NewComicUniverseCartItem
} from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * 购物车数据库服务类
 * 
 * 提供购物车功能相关的数据库操作方法
 */
export class CartDbService {
  /**
   * 获取用户的活跃购物车
   * 
   * @param userId 用户ID
   * @returns 购物车信息
   */
  static async getActiveCart(userId: number): Promise<ComicUniverseCart | null> {
    const [cart] = await db
      .select()
      .from(comicUniverseCarts)
      .where(
        and(
          eq(comicUniverseCarts.userId, userId),
          eq(comicUniverseCarts.status, 'active'),
          eq(comicUniverseCarts.isExpired, false)
        )
      )
      .limit(1);

    return cart || null;
  }

  /**
   * 创建新的购物车
   * 
   * @param userId 用户ID
   * @returns 新创建的购物车
   */
  static async createCart(userId: number): Promise<ComicUniverseCart> {
    const [cart] = await db
      .insert(comicUniverseCarts)
      .values({
        userId,
        status: 'active',
        isExpired: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
      })
      .returning();

    return cart;
  }

  /**
   * 获取或创建用户的活跃购物车
   * 
   * @param userId 用户ID
   * @returns 购物车信息
   */
  static async getOrCreateCart(userId: number): Promise<ComicUniverseCart> {
    let cart = await this.getActiveCart(userId);
    
    if (!cart) {
      cart = await this.createCart(userId);
    }

    return cart;
  }

  /**
   * 获取购物车中的所有商品项
   * 
   * @param cartId 购物车ID
   * @returns 购物车项列表（包含画集信息）
   */
  static async getCartItems(cartId: number): Promise<(ComicUniverseCartItem & { collection: any })[]> {
    const items = await db
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
          description: comicUniverseCollections.description,
          categoryId: comicUniverseCollections.categoryId,
          isPublished: comicUniverseCollections.isPublished,
          createdAt: comicUniverseCollections.createdAt,
          updatedAt: comicUniverseCollections.updatedAt,
        }
      })
      .from(comicUniverseCartItems)
      .innerJoin(comicUniverseCollections, eq(comicUniverseCartItems.collectionId, comicUniverseCollections.id))
      .where(eq(comicUniverseCartItems.cartId, cartId))
      .orderBy(desc(comicUniverseCartItems.addedAt));

    return items;
  }

  /**
   * 添加商品到购物车
   * 
   * @param cartId 购物车ID
   * @param collectionId 画集ID
   * @param quantity 数量
   * @returns 新创建的购物车项
   */
  static async addItemToCart(cartId: number, collectionId: number, quantity: number): Promise<ComicUniverseCartItem> {
    // 检查商品是否已存在
    const existingItem = await db
      .select()
      .from(comicUniverseCartItems)
      .where(
        and(
          eq(comicUniverseCartItems.cartId, cartId),
          eq(comicUniverseCartItems.collectionId, collectionId)
        )
      )
      .limit(1);

    if (existingItem.length > 0) {
      // 如果商品已存在，更新数量
      const [updatedItem] = await db
        .update(comicUniverseCartItems)
        .set({
          quantity: existingItem[0].quantity + quantity,
          updatedAt: new Date(),
        })
        .where(eq(comicUniverseCartItems.id, existingItem[0].id))
        .returning();

      return updatedItem;
    } else {
      // 如果商品不存在，创建新项
      const [newItem] = await db
        .insert(comicUniverseCartItems)
        .values({
          cartId,
          collectionId,
          quantity,
        })
        .returning();

      return newItem;
    }
  }

  /**
   * 更新购物车商品数量
   * 
   * @param cartId 购物车ID
   * @param collectionId 画集ID
   * @param quantity 新数量
   * @returns 更新后的购物车项
   */
  static async updateCartItemQuantity(cartId: number, collectionId: number, quantity: number): Promise<ComicUniverseCartItem | null> {
    if (quantity <= 0) {
      // 如果数量为0或负数，删除该项
      await this.removeItemFromCart(cartId, collectionId);
      return null;
    }

    const [updatedItem] = await db
      .update(comicUniverseCartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(comicUniverseCartItems.cartId, cartId),
          eq(comicUniverseCartItems.collectionId, collectionId)
        )
      )
      .returning();

    return updatedItem || null;
  }

  /**
   * 从购物车移除商品
   * 
   * @param cartId 购物车ID
   * @param collectionId 画集ID
   * @returns 是否成功移除
   */
  static async removeItemFromCart(cartId: number, collectionId: number): Promise<boolean> {
    const result = await db
      .delete(comicUniverseCartItems)
      .where(
        and(
          eq(comicUniverseCartItems.cartId, cartId),
          eq(comicUniverseCartItems.collectionId, collectionId)
        )
      );

    return result.length > 0;
  }

  /**
   * 清空购物车
   * 
   * @param cartId 购物车ID
   * @returns 是否成功清空
   */
  static async clearCart(cartId: number): Promise<boolean> {
    const result = await db
      .delete(comicUniverseCartItems)
      .where(eq(comicUniverseCartItems.cartId, cartId));

    return result.length > 0;
  }

  /**
   * 将购物车标记为已转换（已下单）
   * 
   * @param cartId 购物车ID
   * @returns 更新后的购物车
   */
  static async convertCart(cartId: number): Promise<ComicUniverseCart | null> {
    const [cart] = await db
      .update(comicUniverseCarts)
      .set({
        status: 'converted',
        updatedAt: new Date(),
      })
      .where(eq(comicUniverseCarts.id, cartId))
      .returning();

    return cart || null;
  }

  /**
   * 将购物车标记为已放弃
   * 
   * @param cartId 购物车ID
   * @returns 更新后的购物车
   */
  static async abandonCart(cartId: number): Promise<ComicUniverseCart | null> {
    const [cart] = await db
      .update(comicUniverseCarts)
      .set({
        status: 'abandoned',
        updatedAt: new Date(),
      })
      .where(eq(comicUniverseCarts.id, cartId))
      .returning();

    return cart || null;
  }

  /**
   * 清理过期的购物车
   * 
   * @returns 清理的购物车数量
   */
  static async cleanupExpiredCarts(): Promise<number> {
    const result = await db
      .update(comicUniverseCarts)
      .set({
        isExpired: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(comicUniverseCarts.isExpired, false),
          eq(comicUniverseCarts.status, 'active'),
          // expiresAt < now()
        )
      );

    return result.length;
  }
} 