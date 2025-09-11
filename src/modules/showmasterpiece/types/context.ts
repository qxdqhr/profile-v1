/**
 * ShowMasterpiece 模块 - 上下文类型定义
 * 
 * 这个文件定义了ShowMasterpiece模块中所有上下文相关的TypeScript类型。
 * 将类型定义独立出来可以避免循环依赖问题。
 * 
 * @fileoverview 上下文类型定义
 */

import { Cart } from './cart';

/**
 * 购物车上下文状态接口
 */
export interface CartContextState {
  /** 购物车数据 */
  cart: Cart;
  
  /** 加载状态 */
  loading: boolean;
  
  /** 错误信息 */
  error: string | undefined;
  
  /** 刷新购物车数据 */
  refreshCart: () => Promise<void>;
}
