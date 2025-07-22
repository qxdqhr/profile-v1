/**
 * ShowMasterpiece 模块 - 购物车管理服务
 * 
 * 提供购物车管理相关的API调用服务，包括：
 * - 获取所有用户的购物车数据
 * - 购物车统计信息
 * 
 * @fileoverview 购物车管理服务
 */

/**
 * 购物车管理数据类型
 */
export interface CartAdminData {
  id: number;
  userId: number;
  status: 'active' | 'abandoned' | 'converted';
  isExpired: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string | null;
    email: string | null;
    phone: string;
  } | null;
  items: Array<{
    id: number;
    cartId: number;
    collectionId: number;
    quantity: number;
    addedAt: string;
    updatedAt: string;
    collection: {
      id: number;
      title: string;
      artist: string;
      coverImage: string;
    };
  }>;
  totalQuantity: number;
  totalPrice: number;
  itemCount: number;
}

/**
 * 购物车统计信息类型
 */
export interface CartAdminStats {
  totalCarts: number;
  activeCarts: number;
  convertedCarts: number;
  abandonedCarts: number;
  expiredCarts: number;
  totalItems: number;
  totalQuantity: number;
}

/**
 * 购物车管理API响应类型
 */
export interface CartAdminResponse {
  carts: CartAdminData[];
  stats: CartAdminStats;
}

/**
 * 购物车管理服务类
 * 
 * 提供购物车管理功能相关的API调用方法
 */
export class CartAdminService {
  private static readonly ADMIN_CART_URL = '/api/showmasterpiece/cart/admin';

  /**
   * 获取所有用户的购物车数据（管理员专用）
   * 
   * @returns 所有用户的购物车数据和统计信息
   */
  static async getAllCarts(): Promise<CartAdminResponse> {
    const response = await fetch(this.ADMIN_CART_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '获取购物车管理数据失败' }));
      throw new Error(error.message || '获取购物车管理数据失败');
    }

    return response.json();
  }
}

/**
 * 购物车管理服务函数集
 * 
 * 提供函数式的API调用接口
 */

/**
 * 获取所有用户的购物车数据（管理员专用）
 * 
 * @returns 所有用户的购物车数据和统计信息
 */
export const getAllCarts = (): Promise<CartAdminResponse> => {
  return CartAdminService.getAllCarts();
}; 