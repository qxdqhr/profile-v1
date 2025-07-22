/**
 * ShowMasterpiece 模块 - 购物车功能类型定义
 * 
 * 定义了画集购物车功能相关的TypeScript类型，包括：
 * - 购物车数据模型
 * - API请求和响应类型
 * - 购物车项数据类型
 * - 状态枚举
 * 
 * @fileoverview 购物车功能类型定义
 */

import { ArtCollection } from './index';

/**
 * 购物车项数据模型
 */
export interface CartItem {
  /** 画集ID */
  collectionId: number;
  
  /** 画集信息 */
  collection: ArtCollection;
  
  /** 数量 */
  quantity: number;
  
  /** 添加时间 */
  addedAt: Date;
}

/**
 * 购物车数据模型
 */
export interface Cart {
  /** 购物车项列表 */
  items: CartItem[];
  
  /** 总数量 */
  totalQuantity: number;
  
  /** 总价格 */
  totalPrice: number;
}

/**
 * 添加到购物车请求数据
 */
export interface AddToCartRequest {
  /** 画集ID */
  collectionId: number;
  
  /** 数量 */
  quantity: number;
}

/**
 * 更新购物车项请求数据
 */
export interface UpdateCartItemRequest {
  /** 画集ID */
  collectionId: number;
  
  /** 新数量 */
  quantity: number;
}

/**
 * 从购物车移除请求数据
 */
export interface RemoveFromCartRequest {
  /** 画集ID */
  collectionId: number;
}

/**
 * 清空购物车请求数据
 */
export interface ClearCartRequest {
  // 无需额外参数
}

/**
 * 购物车操作类型
 */
export type CartAction = 
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { collectionId: number; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: Cart };

/**
 * 购物车状态
 */
export interface CartState {
  /** 购物车数据 */
  cart: Cart;
  
  /** 加载状态 */
  loading: boolean;
  
  /** 错误信息 */
  error?: string;
  
  /** 是否显示购物车弹窗 */
  isCartOpen: boolean;
}

/**
 * 批量预订请求数据
 */
export interface BatchBookingRequest {
  /** 用户QQ号 */
  qqNumber: string;
  
  /** 预订项列表 */
  items: {
    /** 画集ID */
    collectionId: number;
    
    /** 数量 */
    quantity: number;
  }[];
  
  /** 备注信息 */
  notes?: string;
}

/**
 * 批量预订响应数据
 */
export interface BatchBookingResponse {
  /** 预订ID列表 */
  bookingIds: number[];
  
  /** 成功预订数量 */
  successCount: number;
  
  /** 失败预订数量 */
  failCount: number;
  
  /** 失败原因 */
  failures?: {
    collectionId: number;
    reason: string;
  }[];
} 