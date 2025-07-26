/**
 * ShowMasterpiece 模块 - 预订管理面板组件
 * 
 * 管理员查看所有用户预订信息的面板组件
 * 
 * @fileoverview 预订管理面板组件
 */

'use client';

import React, { useState } from 'react';
import { Calendar, User, Package, Clock, CheckCircle, XCircle, RefreshCw, Eye, Edit, Save, X, Trash2, Download } from 'lucide-react';
import { BookingAdminData, BookingAdminStats } from '../services/bookingAdminService';
import { BookingStatus, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../types/booking';

/**
 * 预订管理面板组件属性
 */
interface BookingAdminPanelProps {
  /** 预订数据列表 */
  bookings: BookingAdminData[];
  /** 统计信息 */
  stats: BookingAdminStats;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error?: string;
  /** 刷新数据回调 */
  onRefresh: () => void;
  /** 更新预订状态回调 */
  onUpdateStatus: (id: number, status: BookingStatus, adminNotes?: string) => Promise<void>;
  /** 删除预订回调 */
  onDeleteBooking: (id: number) => Promise<void>;
  /** 导出预订数据回调 */
  onExportBookings: (format?: 'csv' | 'excel') => Promise<void>;
}

/**
 * 预订管理面板组件
 * 
 * @param props 组件属性
 * @returns React组件
 */
export const BookingAdminPanel: React.FC<BookingAdminPanelProps> = ({
  bookings,
  stats,
  loading,
  error,
  onRefresh,
  onUpdateStatus,
  onDeleteBooking,
  onExportBookings,
}) => {
  const [selectedBooking, setSelectedBooking] = useState<BookingAdminData | null>(null);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
  const [editingBooking, setEditingBooking] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ status: BookingStatus; adminNotes: string }>({
    status: 'pending',
    adminNotes: '',
  });

  /**
   * 获取状态显示信息
   */
  const getStatusInfo = (status: BookingStatus) => {
    return {
      label: BOOKING_STATUS_LABELS[status],
      color: BOOKING_STATUS_COLORS[status],
    };
  };

  /**
   * 过滤预订数据
   */
  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  /**
   * 格式化时间
   */
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('zh-CN');
  };

  /**
   * 处理编辑预订
   */
  const handleEditBooking = (booking: BookingAdminData) => {
    setEditingBooking(booking.id);
    setEditForm({
      status: booking.status,
      adminNotes: booking.adminNotes || '',
    });
  };

  /**
   * 处理保存编辑
   */
  const handleSaveEdit = async () => {
    if (editingBooking) {
      try {
        console.log('保存编辑:', { bookingId: editingBooking, status: editForm.status, adminNotes: editForm.adminNotes });
        await onUpdateStatus(editingBooking, editForm.status, editForm.adminNotes);
        console.log('编辑保存成功');
        setEditingBooking(null);
        setEditForm({ status: 'pending', adminNotes: '' });
      } catch (error) {
        console.error('保存编辑失败:', error);
        // 保持编辑状态，让用户看到错误
      }
    }
  };

  /**
   * 处理取消编辑
   */
  const handleCancelEdit = () => {
    setEditingBooking(null);
    setEditForm({ status: 'pending', adminNotes: '' });
  };

  /**
   * 处理删除预订
   */
  const handleDeleteBooking = async (bookingId: number) => {
    if (confirm('确定要删除这个预订吗？此操作不可撤销。')) {
      try {
        await onDeleteBooking(bookingId);
        console.log('预订删除成功');
      } catch (error) {
        console.error('删除预订失败:', error);
        // 错误已经在hook中处理，这里不需要额外处理
      }
    }
  };

  /**
   * 处理导出预订数据
   */
  const handleExportBookings = async () => {
    try {
      await onExportBookings('csv');
      console.log('预订数据导出成功');
    } catch (error) {
      console.error('导出预订数据失败:', error);
      // 错误已经在hook中处理，这里不需要额外处理
    }
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar size={20} className="text-blue-600 sm:w-6 sm:h-6" />
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800">{stats.totalBookings}</h3>
              <p className="text-xs sm:text-sm text-slate-600">总预订数</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600 sm:w-6 sm:h-6" />
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800">{stats.pendingBookings}</h3>
              <p className="text-xs sm:text-sm text-slate-600">待确认</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600 sm:w-6 sm:h-6" />
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800">{stats.completedBookings}</h3>
              <p className="text-xs sm:text-sm text-slate-600">已完成</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package size={20} className="text-purple-600 sm:w-6 sm:h-6" />
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800">¥{stats.totalRevenue}</h3>
              <p className="text-xs sm:text-sm text-slate-600">总收入</p>
            </div>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-2 text-sm sm:text-base rounded-lg font-medium transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              onClick={() => setFilterStatus('all')}
            >
              全部
            </button>
            <button
              className={`px-3 py-2 text-sm sm:text-base rounded-lg font-medium transition-colors ${
                filterStatus === 'pending' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              onClick={() => setFilterStatus('pending')}
            >
              待确认
            </button>
            <button
              className={`px-3 py-2 text-sm sm:text-base rounded-lg font-medium transition-colors ${
                filterStatus === 'confirmed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              onClick={() => setFilterStatus('confirmed')}
            >
              已确认
            </button>
            <button
              className={`px-3 py-2 text-sm sm:text-base rounded-lg font-medium transition-colors ${
                filterStatus === 'completed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              onClick={() => setFilterStatus('completed')}
            >
              已完成
            </button>
            <button
              className={`px-3 py-2 text-sm sm:text-base rounded-lg font-medium transition-colors ${
                filterStatus === 'cancelled' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              onClick={() => setFilterStatus('cancelled')}
            >
              已取消
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              刷新
            </button>
            <button
              onClick={handleExportBookings}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              导出CSV
            </button>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400 mr-3 flex-shrink-0">
              <XCircle size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-red-800">加载失败</h3>
              <p className="text-sm text-red-700 mt-1 break-words">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 预订列表 */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 sm:p-12 text-center">
            <Calendar size={40} className="text-slate-400 mx-auto mb-4 sm:w-12 sm:h-12" />
            <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-2">暂无预订数据</h3>
            <p className="text-sm sm:text-base text-slate-600">当前筛选条件下没有找到预订数据</p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const statusInfo = getStatusInfo(booking.status);
            
            return (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <img
                        src={booking.collection.coverImage}
                        alt={booking.collection.title}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">{booking.collection.title}</h3>
                        <p className="text-sm text-slate-600">编号：{booking.collection.number}</p>
                        <p className="text-sm text-slate-600">QQ号：{booking.qqNumber}</p>
                        {booking.phoneNumber && (
                          <p className="text-sm text-slate-600">手机号：{booking.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <p className="text-sm text-slate-500 mt-1"># {booking.id}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <div>
                      <p className="text-xs sm:text-sm text-slate-500">预订数量</p>
                      <p className="text-sm sm:text-base font-medium text-slate-800">{booking.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-500">总价格</p>
                      <p className="text-sm sm:text-base font-medium text-slate-800">¥{booking.totalPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-500">预订时间</p>
                      <p className="text-xs sm:text-sm font-medium text-slate-800">{formatTime(booking.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-500">更新时间</p>
                      <p className="text-xs sm:text-sm font-medium text-slate-800">{formatTime(booking.updatedAt)}</p>
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-500">用户备注</p>
                      <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg break-words">{booking.notes}</p>
                    </div>
                  )}
                  
                  {editingBooking === booking.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">状态</label>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as BookingStatus }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">待确认</option>
                          <option value="confirmed">已确认</option>
                          <option value="completed">已完成</option>
                          <option value="cancelled">已取消</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">管理员备注</label>
                        <textarea
                          value={editForm.adminNotes}
                          onChange={(e) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="输入管理员备注（可选）"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          <Save size={16} />
                          保存
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                        >
                          <X size={16} />
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                        >
                          <Edit size={16} />
                          编辑状态
                        </button>
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                        >
                          <Eye size={16} />
                          查看详情
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                        >
                          <Trash2 size={16} />
                          删除
                        </button>
                      </div>
                      
                      {booking.adminNotes && (
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-slate-500">管理员备注</p>
                          <p className="text-slate-800 text-sm break-words">{booking.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 预订详情弹窗 */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">预订详情</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none p-1"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* 画集信息 */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">画集信息</h3>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <img
                      src={selectedBooking.collection.coverImage}
                      alt={selectedBooking.collection.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-slate-800 truncate">{selectedBooking.collection.title}</h4>
                      <p className="text-sm text-slate-600">编号：{selectedBooking.collection.number}</p>
                      <p className="text-sm text-slate-600">价格：¥{selectedBooking.collection.price || '待定'}</p>
                    </div>
                  </div>
                </div>
                
                {/* 预订信息 */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">预订信息</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-sm text-slate-500">预订ID</p>
                      <p className="font-medium text-slate-800">#{selectedBooking.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">QQ号</p>
                      <p className="font-medium text-slate-800">{selectedBooking.qqNumber}</p>
                    </div>
                    {selectedBooking.phoneNumber && (
                      <div>
                        <p className="text-sm text-slate-500">手机号</p>
                        <p className="font-medium text-slate-800">{selectedBooking.phoneNumber}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-slate-500">预订数量</p>
                      <p className="font-medium text-slate-800">{selectedBooking.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">总价格</p>
                      <p className="font-medium text-slate-800">¥{selectedBooking.totalPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">状态</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(selectedBooking.status).color}`}>
                        {getStatusInfo(selectedBooking.status).label}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 时间信息 */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">时间信息</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-500">预订时间</p>
                      <p className="text-sm font-medium text-slate-800">{formatTime(selectedBooking.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">更新时间</p>
                      <p className="text-sm font-medium text-slate-800">{formatTime(selectedBooking.updatedAt)}</p>
                    </div>
                    {selectedBooking.confirmedAt && (
                      <div>
                        <p className="text-sm text-slate-500">确认时间</p>
                        <p className="text-sm font-medium text-slate-800">{formatTime(selectedBooking.confirmedAt)}</p>
                      </div>
                    )}
                    {selectedBooking.completedAt && (
                      <div>
                        <p className="text-sm text-slate-500">完成时间</p>
                        <p className="text-sm font-medium text-slate-800">{formatTime(selectedBooking.completedAt)}</p>
                      </div>
                    )}
                    {selectedBooking.cancelledAt && (
                      <div>
                        <p className="text-sm text-slate-500">取消时间</p>
                        <p className="text-sm font-medium text-slate-800">{formatTime(selectedBooking.cancelledAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 备注信息 */}
                {selectedBooking.notes && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">用户备注</h3>
                    <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-lg break-words">{selectedBooking.notes}</p>
                  </div>
                )}
                
                {selectedBooking.adminNotes && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">管理员备注</h3>
                    <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-lg break-words">{selectedBooking.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 