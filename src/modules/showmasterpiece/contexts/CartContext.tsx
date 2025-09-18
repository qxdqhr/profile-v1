/**
 * ShowMasterpiece 模块 - 购物车上下文
 * 
 * 提供购物车状态的全局管理，包括：
 * - 购物车数据状态
 * - 购物车数据刷新
 * - 购物车更新通知
 * 
 * @fileoverview 购物车上下文
 */

'use client';

import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Cart, AddToCartRequest, UpdateCartItemRequest, RemoveFromCartRequest, BatchBookingRequest, BatchBookingResponse } from '../types/cart';
import { getCart, addToCart, updateCartItem, removeFromCart, batchBooking, clearCart } from '../services';
import { cartUpdateEvents, CART_UPDATE_EVENT } from '../hooks';
import type { CartContextState } from '../types/context';

/**
 * 购物车上下文类型
 */
export const CartContext = createContext<CartContextState | undefined>(undefined);

/**
 * 购物车上下文提供者属性
 */
interface CartProviderProps {
  children: ReactNode;
  userId: number;
  eventParam?: string; // 活动参数，用于购物车数据隔离
}

/**
 * 购物车上下文提供者组件
 * 
 * @param props 组件属性
 * @returns React组件
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children, userId, eventParam }) => {
  const [state, setState] = useState<CartContextState>({
    cart: {
      items: [],
      totalQuantity: 0,
      totalPrice: 0
    },
    loading: false,
    error: undefined,
    refreshCart: async () => {},
    addToCart: async () => {},
    updateCartItem: async () => {},
    removeFromCart: async () => {},
    batchBooking: async () => ({ successCount: 0, failCount: 0, bookingIds: [], failures: [] }),
    clearCart: async () => {}
  });

  /**
   * 刷新购物车数据
   */
  const refreshCart = useCallback(async () => {
    if (!userId) return;

    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      // 传递活动参数到购物车服务
      const cartData = await getCart(userId, eventParam);
      setState(prev => ({ 
        ...prev, 
        cart: cartData,
        loading: false 
      }));
    } catch (error) {
      console.error('刷新购物车失败:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '刷新购物车失败' 
      }));
    }
  }, [userId, eventParam]);

  /**
   * 添加商品到购物车（活动感知）
   */
  const addToCartWithEvent = useCallback(async (request: AddToCartRequest & { collection?: any }) => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      console.log('🛒 [CartContext] 添加到购物车 (活动感知):', { request, eventParam, userId });
      
      // 调用活动感知的添加到购物车服务
      await addToCart({ ...request, userId }, eventParam);
      
      // 刷新购物车数据
      await refreshCart();
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('添加到购物车失败:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '添加到购物车失败' 
      }));
    }
  }, [refreshCart, eventParam, userId]);

  /**
   * 更新购物车商品数量（活动感知）
   */
  const updateCartItemWithEvent = useCallback(async (request: UpdateCartItemRequest) => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      console.log('🔢 [CartContext] 更新购物车数量 (活动感知):', { request, eventParam, userId });
      
      // 调用活动感知的更新购物车数量服务
      await updateCartItem({ ...request, userId }, eventParam);
      
      // 刷新购物车数据
      await refreshCart();
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('更新购物车数量失败:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '更新购物车数量失败' 
      }));
    }
  }, [refreshCart, eventParam, userId]);

  /**
   * 从购物车移除商品（活动感知）
   */
  const removeFromCartWithEvent = useCallback(async (request: RemoveFromCartRequest) => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      console.log('🗑️ [CartContext] 移除商品 (活动感知):', { request, eventParam, userId });
      
      // 调用活动感知的移除商品服务
      await removeFromCart({ ...request, userId }, eventParam);
      
      // 刷新购物车数据
      await refreshCart();
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('移除商品失败:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '移除商品失败' 
      }));
    }
  }, [refreshCart, eventParam, userId]);

  /**
   * 批量预订购物车商品（活动感知）
   */
  const batchBookingWithEvent = useCallback(async (request: BatchBookingRequest): Promise<BatchBookingResponse> => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      console.log('📋 [CartContext] 批量预订 (活动感知):', { request, eventParam, userId });
      
      // 调用活动感知的批量预订服务
      const result = await batchBooking(request, state.cart, eventParam);
      
      // 预订成功后刷新购物车（可能需要清空）
      await refreshCart();
      
      setState(prev => ({ ...prev, loading: false }));
      
      return result;
    } catch (error) {
      console.error('批量预订失败:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '批量预订失败' 
      }));
      throw error;
    }
  }, [refreshCart, eventParam, userId, state.cart]);

  /**
   * 清空购物车（活动感知）
   */
  const clearCartWithEvent = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      console.log('🗑️ [CartContext] 清空购物车 (活动感知):', { eventParam, userId });
      
      // 调用活动感知的清空购物车服务
      await clearCart(userId, eventParam);
      
      // 刷新购物车数据
      await refreshCart();
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('清空购物车失败:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '清空购物车失败' 
      }));
    }
  }, [refreshCart, eventParam, userId]);

  // 初始化时加载购物车数据
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // 监听购物车更新事件
  useEffect(() => {
    const handleCartUpdate = () => {
      refreshCart();
    };

    cartUpdateEvents.addEventListener(CART_UPDATE_EVENT, handleCartUpdate);

    return () => {
      cartUpdateEvents.removeEventListener(CART_UPDATE_EVENT, handleCartUpdate);
    };
  }, [refreshCart]);

  const contextValue: CartContextState = {
    ...state,
    refreshCart,
    addToCart: addToCartWithEvent,
    updateCartItem: updateCartItemWithEvent,
    removeFromCart: removeFromCartWithEvent,
    batchBooking: batchBookingWithEvent,
    clearCart: clearCartWithEvent
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
