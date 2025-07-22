/**
 * ShowMasterpiece 模块 - 购物车管理Hook
 * 
 * 提供购物车管理功能相关的状态管理和业务逻辑，包括：
 * - 购物车管理数据状态管理
 * - 购物车管理数据加载
 * - 错误处理和加载状态
 * 
 * @fileoverview 购物车管理Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  CartAdminData, 
  CartAdminStats,
  CartAdminResponse
} from '../services/cartAdminService';
import { getAllCarts } from '../services/cartAdminService';

/**
 * 购物车管理状态类型
 */
interface CartAdminState {
  carts: CartAdminData[];
  stats: CartAdminStats;
  loading: boolean;
  error: string | undefined;
}

/**
 * 购物车管理Hook
 * 
 * 管理购物车管理页面的状态和业务逻辑
 * 
 * @returns 购物车管理状态和操作方法
 */
export function useCartAdmin() {
  const [state, setState] = useState<CartAdminState>({
    carts: [],
    stats: {
      totalCarts: 0,
      activeCarts: 0,
      convertedCarts: 0,
      abandonedCarts: 0,
      expiredCarts: 0,
      totalItems: 0,
      totalQuantity: 0,
    },
    loading: false,
    error: undefined
  });

  /**
   * 加载购物车管理数据
   */
  const loadCartAdminData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      const data: CartAdminResponse = await getAllCarts();
      setState(prev => ({ 
        ...prev, 
        carts: data.carts,
        stats: data.stats,
        loading: false 
      }));
    } catch (error) {
      console.error('加载购物车管理数据失败:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '加载购物车管理数据失败' 
      }));
    }
  }, []);

  /**
   * 清除错误信息
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: undefined }));
  }, []);

  /**
   * 刷新数据
   */
  const refreshData = useCallback(async () => {
    await loadCartAdminData();
  }, [loadCartAdminData]);

  // 组件挂载时加载数据
  useEffect(() => {
    loadCartAdminData();
  }, [loadCartAdminData]);

  return {
    // 状态
    carts: state.carts,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    
    // 操作方法
    loadCartAdminData,
    refreshData,
    clearError,
  };
} 