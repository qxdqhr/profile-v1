/**
 * ShowMasterpiece 模块 - 预订管理Hook
 * 
 * 提供预订管理功能的状态管理和数据获取逻辑，包括：
 * - 获取所有预订数据
 * - 预订统计信息
 * - 状态更新
 * - 加载和错误状态管理
 * 
 * @fileoverview 预订管理Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  BookingAdminData, 
  BookingAdminStats, 
  BookingAdminResponse,
  getAllBookings,
  getBookingStats,
  forceRefreshAllBookings,
  forceRefreshBookingStats,
  updateBookingStatus as updateBookingStatusService
} from '../services/bookingAdminService';
import { BookingStatus } from '../types/booking';

/**
 * 预订管理Hook返回值类型
 */
interface UseBookingAdminReturn {
  /** 预订数据列表 */
  bookings: BookingAdminData[];
  /** 统计信息 */
  stats: BookingAdminStats;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error?: string;
  /** 刷新数据 */
  refreshData: () => Promise<void>;
  /** 更新预订状态 */
  updateBookingStatus: (id: number, status: BookingStatus, adminNotes?: string) => Promise<void>;
  /** 清除错误 */
  clearError: () => void;
}

/**
 * 预订管理Hook
 * 
 * 提供预订管理功能的状态管理和数据获取逻辑
 * 
 * @returns 预订管理Hook返回值
 */
export const useBookingAdmin = (): UseBookingAdminReturn => {
  const [bookings, setBookings] = useState<BookingAdminData[]>([]);
  const [stats, setStats] = useState<BookingAdminStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalQuantity: 0,
    totalRevenue: 0,
    totalAmount: 0,
    todayBookings: 0,
    weekBookings: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  /**
   * 获取预订数据
   */
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      
      console.log('🔄 开始获取预订数据（使用强制刷新API）...');
      const [bookingsData, statsData] = await Promise.all([
        forceRefreshAllBookings(),
        forceRefreshBookingStats()
      ]);
      
      console.log('✅ 获取到预订数据:', { 
        bookingsCount: bookingsData.length, 
        stats: statsData,
        timestamp: new Date().toISOString()
      });
      
      setBookings(bookingsData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取预订数据失败';
      setError(errorMessage);
      console.error('❌ 获取预订数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 更新预订状态
   */
  const updateBookingStatus = useCallback(async (
    id: number, 
    status: BookingStatus, 
    adminNotes?: string
  ) => {
    try {
      setError(undefined);
      console.log('开始更新预订状态:', { id, status, adminNotes });
      
      await updateBookingStatusService(id, status, adminNotes);
      console.log('预订状态更新成功');
      
      // 重新获取所有数据以确保数据一致性
      await fetchBookings();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新预订状态失败';
      setError(errorMessage);
      console.error('更新预订状态失败:', err);
      throw err; // 重新抛出错误，让调用者知道更新失败
    }
  }, [fetchBookings]);

  /**
   * 刷新数据
   */
  const refreshData = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);



  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  /**
   * 组件挂载时获取数据
   */
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    stats,
    loading,
    error,
    refreshData,
    updateBookingStatus,
    clearError,
  };
}; 