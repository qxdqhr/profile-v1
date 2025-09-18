/**
 * ShowMasterpiece 模块 - 购物车服务
 * 
 * 提供购物车功能的前端本地存储服务，包括：
 * - 添加商品到购物车
 * - 更新购物车商品数量
 * - 从购物车移除商品
 * - 清空购物车
 * - 批量预订
 * 
 * @fileoverview 购物车服务 - 本地存储版本
 */

import { 
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveFromCartRequest,
  ClearCartRequest,
  BatchBookingRequest,
  BatchBookingResponse
} from '../types/cart';
import { saveCartHistory } from './cartHistoryService';

/**
 * 购物车本地存储键名
 */
const CART_STORAGE_KEY = 'showmasterpiece_cart';

/**
 * 购物车服务类
 * 
 * 提供购物车功能相关的本地存储操作方法
 */
export class CartService {
  private static readonly BOOKING_URL = '/api/showmasterpiece/bookings/batch';

  /**
   * 获取购物车数据
   * 
   * @param userId 用户ID
   * @param eventParam 活动参数，用于购物车数据隔离
   * @returns 购物车数据
   */
  static async getCart(userId: number, eventParam?: string): Promise<Cart> {
    try {
      // 生成包含活动信息的存储键
      const storageKey = eventParam 
        ? `${CART_STORAGE_KEY}_${userId}_${eventParam}`
        : `${CART_STORAGE_KEY}_${userId}`;
        
      const cartData = localStorage.getItem(storageKey);
      if (cartData) {
        const parsed = JSON.parse(cartData);
        // 将字符串日期转换为Date对象
        if (parsed.items) {
          parsed.items = parsed.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }));
        }
        return parsed;
      }
    } catch (error) {
      console.error('读取购物车数据失败:', error);
    }
    
    // 返回空的购物车
    return {
      items: [],
      totalQuantity: 0,
      totalPrice: 0
    };
  }

  /**
   * 保存购物车数据到本地存储
   * 
   * @param userId 用户ID
   * @param cart 购物车数据
   * @param eventParam 活动参数，用于购物车数据隔离
   */
  private static saveCart(userId: number, cart: Cart, eventParam?: string): void {
    try {
      // 生成包含活动信息的存储键
      const storageKey = eventParam 
        ? `${CART_STORAGE_KEY}_${userId}_${eventParam}`
        : `${CART_STORAGE_KEY}_${userId}`;
        
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch (error) {
      console.error('保存购物车数据失败:', error);
    }
  }

  /**
   * 计算购物车总数量和总价格
   * 
   * @param items 购物车商品项
   * @returns 总数量和总价格
   */
  private static calculateTotals(items: Cart['items']): { totalQuantity: number; totalPrice: number } {
    let totalQuantity = 0;
    let totalPrice = 0;
    
    items.forEach(item => {
      totalQuantity += item.quantity;
      const itemPrice = (item.collection.price || 0) * item.quantity;
      totalPrice += itemPrice;
    });
    
    return { totalQuantity, totalPrice };
  }

  /**
   * 添加商品到购物车
   * 
   * @param data 添加商品数据
   * @param eventParam 活动参数，用于购物车数据隔离
   * @returns 更新后的购物车数据
   */
  static async addToCart(data: AddToCartRequest & { userId: number; collection?: any }, eventParam?: string): Promise<Cart> {
    const { userId, collectionId, quantity, collection } = data;
    
    // 获取当前购物车（包含活动参数）
    const cart = await this.getCart(userId, eventParam);
    
    // 检查商品是否已在购物车中
    const existingItemIndex = cart.items.findIndex(item => item.collectionId === collectionId);
    
    if (existingItemIndex >= 0) {
      // 如果已存在，增加数量
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // 如果不存在，添加新项
      if (collection) {
        // 使用传入的完整画集信息
        cart.items.push({
          collectionId,
          collection,
          quantity,
          addedAt: new Date()
        });
      } else {
        // 如果没有传入画集信息，使用简化的数据结构
        cart.items.push({
          collectionId,
          collection: {
            id: collectionId,
            title: `画集${collectionId}`, // 临时标题，实际应该从画集数据中获取
            number: '未知编号',
            coverImage: '',
            description: '',
            pages: [],
            category: '画集' as any,
            tags: [],
            isPublished: true,
            price: 0
          },
          quantity,
          addedAt: new Date()
        });
      }
    }
    
    // 重新计算总数量和总价格
    const { totalQuantity, totalPrice } = this.calculateTotals(cart.items);
    cart.totalQuantity = totalQuantity;
    cart.totalPrice = totalPrice;
    
    // 保存到本地存储（包含活动参数）
    this.saveCart(userId, cart, eventParam);
    
    return cart;
  }

  /**
   * 更新购物车商品数量
   * 
   * @param data 更新商品数据
   * @param eventParam 活动参数，用于购物车数据隔离
   * @returns 更新后的购物车数据
   */
  static async updateCartItem(data: UpdateCartItemRequest & { userId: number }, eventParam?: string): Promise<Cart> {
    const { userId, collectionId, quantity } = data;
    
    // 获取当前购物车（包含活动参数）
    const cart = await this.getCart(userId, eventParam);
    
    // 查找商品项
    const itemIndex = cart.items.findIndex(item => item.collectionId === collectionId);
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // 如果数量为0或负数，移除商品
        cart.items.splice(itemIndex, 1);
      } else {
        // 更新数量
        cart.items[itemIndex].quantity = quantity;
      }
      
      // 重新计算总数量和总价格
      const { totalQuantity, totalPrice } = this.calculateTotals(cart.items);
      cart.totalQuantity = totalQuantity;
      cart.totalPrice = totalPrice;
      
      // 保存到本地存储（包含活动参数）
      this.saveCart(userId, cart, eventParam);
    }
    
    return cart;
  }

  /**
   * 从购物车移除商品
   * 
   * @param data 移除商品数据
   * @param eventParam 活动参数，用于购物车数据隔离
   * @returns 更新后的购物车数据
   */
  static async removeFromCart(data: RemoveFromCartRequest & { userId: number }, eventParam?: string): Promise<Cart> {
    const { userId, collectionId } = data;
    
    // 获取当前购物车（包含活动参数）
    const cart = await this.getCart(userId, eventParam);
    
    // 移除商品
    cart.items = cart.items.filter(item => item.collectionId !== collectionId);
    
    // 重新计算总数量和总价格
    const { totalQuantity, totalPrice } = this.calculateTotals(cart.items);
    cart.totalQuantity = totalQuantity;
    cart.totalPrice = totalPrice;
    
    // 保存到本地存储（包含活动参数）
    this.saveCart(userId, cart, eventParam);
    
    return cart;
  }

  /**
   * 清空购物车
   * 
   * @param userId 用户ID
   * @param eventParam 活动参数，用于购物车数据隔离
   * @returns 清空后的购物车数据
   */
  static async clearCart(userId: number, eventParam?: string): Promise<Cart> {
    const emptyCart: Cart = {
      items: [],
      totalQuantity: 0,
      totalPrice: 0
    };
    
    // 保存空的购物车到本地存储（包含活动参数）
    this.saveCart(userId, emptyCart, eventParam);
    
    return emptyCart;
  }

  /**
   * 批量预订购物车中的商品
   * 
   * @param data 批量预订数据
   * @param cart 当前购物车数据（用于保存历史记录）
   * @param eventParam 活动参数，用于预订数据隔离
   * @returns 预订结果
   */
  static async batchBooking(data: BatchBookingRequest, cart?: Cart, eventParam?: string): Promise<BatchBookingResponse> {
    // 将活动参数添加到请求数据中
    const requestData = {
      ...data,
      eventParam
    };
    
    console.log('🛒 [CartService] 批量预订 (活动感知):', { data, eventParam });
    
    const response = await fetch(this.BOOKING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '批量预订失败' }));
      throw new Error(error.message || '批量预订失败');
    }

    const result = await response.json();

    // 如果预订成功且有购物车数据，保存历史记录
    if (result.successCount > 0 && cart) {
      try {
        await saveCartHistory({
          qqNumber: data.qqNumber,
          phoneNumber: data.phoneNumber,
          items: cart.items,
          totalQuantity: cart.totalQuantity,
          totalPrice: cart.totalPrice,
          notes: data.notes,
          pickupMethod: data.pickupMethod,
          status: 'pending',
          bookingIds: result.bookingIds,
          submittedAt: new Date()
        });
      } catch (error) {
        console.error('保存购物车历史记录失败:', error);
        // 不影响预订流程，只记录错误
      }
    }

    return result;
  }
}

/**
 * 购物车服务函数集
 * 
 * 提供函数式的API调用接口，作为服务类的补充。
 */

/**
 * 获取购物车数据
 * 
 * @param userId 用户ID
 * @param eventParam 活动参数，用于购物车数据隔离
 * @returns 购物车数据
 */
export const getCart = (userId: number, eventParam?: string): Promise<Cart> => {
  return CartService.getCart(userId, eventParam);
};

/**
 * 添加商品到购物车
 * 
 * @param data 添加商品数据
 * @param eventParam 活动参数，用于购物车数据隔离
 * @returns 更新后的购物车数据
 */
export const addToCart = (data: AddToCartRequest & { userId: number }, eventParam?: string): Promise<Cart> => {
  return CartService.addToCart(data, eventParam);
};

/**
 * 更新购物车商品数量
 * 
 * @param data 更新商品数据
 * @param eventParam 活动参数，用于购物车数据隔离
 * @returns 更新后的购物车数据
 */
export const updateCartItem = (data: UpdateCartItemRequest & { userId: number }, eventParam?: string): Promise<Cart> => {
  return CartService.updateCartItem(data, eventParam);
};

/**
 * 从购物车移除商品
 * 
 * @param data 移除商品数据
 * @param eventParam 活动参数，用于购物车数据隔离
 * @returns 更新后的购物车数据
 */
export const removeFromCart = (data: RemoveFromCartRequest & { userId: number }, eventParam?: string): Promise<Cart> => {
  return CartService.removeFromCart(data, eventParam);
};

/**
 * 清空购物车
 * 
 * @param userId 用户ID
 * @param eventParam 活动参数，用于购物车数据隔离
 * @returns 清空后的购物车数据
 */
export const clearCart = (userId: number, eventParam?: string): Promise<Cart> => {
  return CartService.clearCart(userId, eventParam);
};

/**
 * 批量预订购物车中的商品
 * 
 * @param data 批量预订数据
 * @param cart 当前购物车数据（用于保存历史记录）
 * @param eventParam 活动参数，用于预订数据隔离
 * @returns 预订结果
 */
export const batchBooking = (data: BatchBookingRequest, cart?: Cart, eventParam?: string): Promise<BatchBookingResponse> => {
  return CartService.batchBooking(data, cart, eventParam);
}; 