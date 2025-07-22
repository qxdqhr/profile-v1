/**
 * ShowMasterpiece 模块 - 购物车上下文
 * 
 * 提供购物车状态的全局管理，确保所有组件都能实时获取最新的购物车数据
 * 
 * @fileoverview 购物车上下文
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Cart } from '../types/cart';
import { getCart } from '../services/cartService';
import { cartUpdateEvents, CART_UPDATE_EVENT } from '../hooks/useCart';

/**
 * 购物车上下文状态类型
 */
interface CartContextState {
  cart: Cart;
  loading: boolean;
  error: string | undefined;
  refreshCart: () => Promise<void>;
}

/**
 * 购物车上下文类型
 */
const CartContext = createContext<CartContextState | undefined>(undefined);

/**
 * 购物车上下文提供者属性
 */
interface CartProviderProps {
  children: ReactNode;
  userId: number;
}

/**
 * 购物车上下文提供者组件
 * 
 * @param props 组件属性
 * @returns React组件
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children, userId }) => {
  const [state, setState] = useState<CartContextState>({
    cart: {
      items: [],
      totalQuantity: 0,
      totalPrice: 0
    },
    loading: false,
    error: undefined,
    refreshCart: async () => {}
  });

  /**
   * 刷新购物车数据
   */
  const refreshCart = useCallback(async () => {
    if (!userId) return;

    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      const cartData = await getCart(userId);
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
  }, [userId]);

  // 初始化时加载购物车数据
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // 定期刷新购物车数据（每10秒）
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      refreshCart();
    }, 10000); // 10秒刷新一次

    return () => clearInterval(interval);
  }, [userId, refreshCart]);

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
    refreshCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

/**
 * 使用购物车上下文的Hook
 * 
 * @returns 购物车上下文状态
 */
export const useCartContext = (): CartContextState => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}; 