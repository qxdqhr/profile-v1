/**
 * ShowMasterpiece 模块 - 预订管理服务
 * 
 * 提供预订管理相关的类型定义和服务函数
 * 
 * @fileoverview 预订管理服务
 */

import { BookingStatus } from '../types/booking';

/**
 * 预订管理数据接口
 */
export interface BookingAdminData {
  /** 预订ID */
  id: number;
  /** 用户ID */
  userId: number;
  /** 用户名 */
  userName: string;
  /** 用户手机号 */
  userPhone: string;
  /** QQ号 */
  qqNumber?: string;
  /** 手机号 */
  phoneNumber?: string;
  /** 画集ID */
  collectionId: number;
  /** 画集标题 */
  collectionTitle: string;
  /** 画集艺术家 */
  collectionArtist: string;
  /** 画集信息 */
  collection: {
    /** 画集ID */
    id: number;
    /** 画集标题 */
    title: string;
    /** 画集艺术家 */
    artist: string;
    /** 封面图片 */
    coverImage: string;
    /** 价格 */
    price: number;
  };
  /** 预订状态 */
  status: BookingStatus;
  /** 预订时间 */
  bookingTime: string;
  /** 更新时间 */
  updatedAt: string;
  /** 创建时间 */
  createdAt: string;
  /** 管理员备注 */
  adminNotes?: string;
  /** 用户备注 */
  notes?: string;
  /** 数量 */
  quantity: number;
  /** 价格 */
  price: number;
  /** 总价格 */
  totalPrice: number;
  /** 确认时间 */
  confirmedAt?: string;
  /** 完成时间 */
  completedAt?: string;
  /** 取消时间 */
  cancelledAt?: string;
}

/**
 * 预订管理统计信息接口
 */
export interface BookingAdminStats {
  /** 总预订数 */
  totalBookings: number;
  /** 待处理预订数 */
  pendingBookings: number;
  /** 已确认预订数 */
  confirmedBookings: number;
  /** 已完成预订数 */
  completedBookings: number;
  /** 已取消预订数 */
  cancelledBookings: number;
  /** 总金额 */
  totalAmount: number;
  /** 总收入 */
  totalRevenue: number;
  /** 总数量 */
  totalQuantity: number;
  /** 今日新增预订数 */
  todayBookings: number;
  /** 本周新增预订数 */
  weekBookings: number;
}

/**
 * 预订管理接口响应类型
 */
export interface BookingAdminResponse {
  bookings: BookingAdminData[];
  stats: BookingAdminStats;
}

/**
 * 预订管理服务类
 */
export class BookingAdminService {
  /**
   * 获取所有预订数据
   */
  static async getAllBookings(): Promise<BookingAdminData[]> {
    try {
      // 添加时间戳参数防止缓存
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const response = await fetch(`/api/showmasterpiece/bookings/admin?t=${timestamp}&forceRefresh=${randomId}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (!response.ok) {
        throw new Error('获取预订数据失败');
      }
      const data = await response.json();
      return data.bookings || [];
    } catch (error) {
      console.error('获取预订数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取预订统计信息
   */
  static async getBookingStats(): Promise<BookingAdminStats> {
    try {
      // 添加时间戳参数防止缓存
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const response = await fetch(`/api/showmasterpiece/bookings/admin?t=${timestamp}&forceRefresh=${randomId}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (!response.ok) {
        throw new Error('获取统计信息失败');
      }
      const data = await response.json();
      return data.stats || {
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
      };
    } catch (error) {
      console.error('获取统计信息失败:', error);
      throw error;
    }
  }

  /**
   * 更新预订状态
   */
  static async updateBookingStatus(
    bookingId: number, 
    status: BookingStatus, 
    adminNotes?: string
  ): Promise<void> {
    try {
      const response = await fetch(`/api/showmasterpiece/bookings/admin/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminNotes }),
      });
      
      if (!response.ok) {
        throw new Error('更新预订状态失败');
      }
    } catch (error) {
      console.error('更新预订状态失败:', error);
      throw error;
    }
  }

  /**
   * 删除预订
   */
  static async deleteBooking(bookingId: number): Promise<void> {
    try {
      const response = await fetch(`/api/showmasterpiece/bookings/admin/${bookingId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('删除预订失败');
      }
    } catch (error) {
      console.error('删除预订失败:', error);
      throw error;
    }
  }

  /**
   * 导出预订数据
   */
  static async exportBookings(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const response = await fetch(`/api/showmasterpiece/bookings/admin/export?format=${format}`);
      if (!response.ok) {
        throw new Error('导出预订数据失败');
      }
      return await response.blob();
    } catch (error) {
      console.error('导出预订数据失败:', error);
      throw error;
    }
  }
}

// 导出单独的函数，方便直接导入使用
export const getAllBookings = BookingAdminService.getAllBookings;
export const getBookingStats = BookingAdminService.getBookingStats;
export const updateBookingStatus = BookingAdminService.updateBookingStatus;
export const deleteBooking = BookingAdminService.deleteBooking;
export const exportBookings = BookingAdminService.exportBookings; 