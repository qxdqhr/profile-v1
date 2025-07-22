/**
 * ShowMasterpiece 模块 - 购物车服务
 * 
 * 提供购物车功能的前端API调用服务，包括：
 * - 添加商品到购物车
 * - 更新购物车商品数量
 * - 从购物车移除商品
 * - 清空购物车
 * - 批量预订
 * 
 * @fileoverview 购物车服务
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

/**
 * 购物车服务类
 * 
 * 提供购物车功能相关的API调用方法，使用面向对象的方式封装HTTP请求。
 */
export class CartService {
  private static readonly CART_URL = '/api/showmasterpiece/cart';
  private static readonly BOOKING_URL = '/api/showmasterpiece/bookings/batch';

  /**
   * 获取购物车数据
   * 
   * @param userId 用户ID
   * @returns 购物车数据
   */
  static async getCart(userId: number): Promise<Cart> {
    const response = await fetch(`${this.CART_URL}?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '获取购物车失败' }));
      throw new Error(error.message || '获取购物车失败');
    }

    return response.json();
  }

  /**
   * 添加商品到购物车
   * 
   * @param data 添加商品数据
   * @returns 更新后的购物车数据
   */
  static async addToCart(data: AddToCartRequest & { userId: number }): Promise<Cart> {
    const response = await fetch(`${this.CART_URL}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '添加到购物车失败' }));
      throw new Error(error.message || '添加到购物车失败');
    }

    return response.json();
  }

  /**
   * 更新购物车商品数量
   * 
   * @param data 更新商品数据
   * @returns 更新后的购物车数据
   */
  static async updateCartItem(data: UpdateCartItemRequest & { userId: number }): Promise<Cart> {
    const response = await fetch(`${this.CART_URL}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '更新购物车失败' }));
      throw new Error(error.message || '更新购物车失败');
    }

    return response.json();
  }

  /**
   * 从购物车移除商品
   * 
   * @param data 移除商品数据
   * @returns 更新后的购物车数据
   */
  static async removeFromCart(data: RemoveFromCartRequest & { userId: number }): Promise<Cart> {
    const response = await fetch(`${this.CART_URL}/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '从购物车移除失败' }));
      throw new Error(error.message || '从购物车移除失败');
    }

    return response.json();
  }

  /**
   * 清空购物车
   * 
   * @param userId 用户ID
   * @returns 清空后的购物车数据
   */
  static async clearCart(userId: number): Promise<Cart> {
    const response = await fetch(`${this.CART_URL}/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '清空购物车失败' }));
      throw new Error(error.message || '清空购物车失败');
    }

    return response.json();
  }

  /**
   * 批量预订购物车中的商品
   * 
   * @param data 批量预订数据
   * @returns 批量预订结果
   */
  static async batchBooking(data: BatchBookingRequest): Promise<BatchBookingResponse> {
    const response = await fetch(this.BOOKING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '批量预订失败' }));
      throw new Error(error.message || '批量预订失败');
    }

    return response.json();
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
 * @returns 购物车数据
 */
export const getCart = (userId: number): Promise<Cart> => {
  return CartService.getCart(userId);
};

/**
 * 添加商品到购物车
 * 
 * @param data 添加商品数据
 * @returns 更新后的购物车数据
 */
export const addToCart = (data: AddToCartRequest & { userId: number }): Promise<Cart> => {
  return CartService.addToCart(data);
};

/**
 * 更新购物车商品数量
 * 
 * @param data 更新商品数据
 * @returns 更新后的购物车数据
 */
export const updateCartItem = (data: UpdateCartItemRequest & { userId: number }): Promise<Cart> => {
  return CartService.updateCartItem(data);
};

/**
 * 从购物车移除商品
 * 
 * @param data 移除商品数据
 * @returns 更新后的购物车数据
 */
export const removeFromCart = (data: RemoveFromCartRequest & { userId: number }): Promise<Cart> => {
  return CartService.removeFromCart(data);
};

/**
 * 清空购物车
 * 
 * @param userId 用户ID
 * @returns 清空后的购物车数据
 */
export const clearCart = (userId: number): Promise<Cart> => {
  return CartService.clearCart(userId);
};

/**
 * 批量预订购物车中的商品
 * 
 * @param data 批量预订数据
 * @returns 批量预订结果
 */
export const batchBooking = (data: BatchBookingRequest): Promise<BatchBookingResponse> => {
  return CartService.batchBooking(data);
}; 