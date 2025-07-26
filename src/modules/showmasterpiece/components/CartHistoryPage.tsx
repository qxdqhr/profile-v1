/**
 * ShowMasterpiece 模块 - 购物车历史记录页面组件
 * 
 * 用户查看自己提交的购物车历史记录
 * 
 * @fileoverview 购物车历史记录页面组件
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Package, Clock, CheckCircle, XCircle, Trash2, RefreshCw, Eye } from 'lucide-react';
import { CartHistoryItem, CartHistory } from '../types/cart';
import { getCartHistory, deleteHistoryRecord, clearUserHistory } from '../services/cartHistoryService';

/**
 * 购物车历史记录页面组件属性
 */
interface CartHistoryPageProps {
  /** 用户QQ号 */
  qqNumber: string;
  /** 用户手机号 */
  phoneNumber: string;
}

/**
 * 状态显示信息
 */
const STATUS_INFO = {
  pending: { label: '待确认', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '已确认', color: 'bg-blue-100 text-blue-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-800' }
};

/**
 * 购物车历史记录页面组件
 * 
 * @param props 组件属性
 * @returns React组件
 */
export const CartHistoryPage: React.FC<CartHistoryPageProps> = ({
  qqNumber,
  phoneNumber
}) => {
  const [history, setHistory] = useState<CartHistory>({ records: [], totalRecords: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [selectedRecord, setSelectedRecord] = useState<CartHistoryItem | null>(null);

  /**
   * 加载历史记录
   */
  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(undefined);
      
      const historyData = await getCartHistory(qqNumber, phoneNumber);
      setHistory(historyData);
      
      console.log('✅ 购物车历史记录加载成功:', { 
        totalRecords: historyData.totalRecords 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载历史记录失败';
      setError(errorMessage);
      console.error('加载购物车历史记录失败:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除历史记录
   */
  const handleDeleteRecord = async (recordId: string) => {
    if (confirm('确定要删除这条历史记录吗？此操作不可撤销。')) {
      try {
        await deleteHistoryRecord(qqNumber, phoneNumber, recordId);
        console.log('历史记录删除成功');
        
        // 重新加载历史记录
        await loadHistory();
      } catch (error) {
        console.error('删除历史记录失败:', error);
        alert('删除历史记录失败');
      }
    }
  };

  /**
   * 清空所有历史记录
   */
  const handleClearAllHistory = async () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
      try {
        await clearUserHistory(qqNumber, phoneNumber);
        console.log('所有历史记录清空成功');
        
        // 重新加载历史记录
        await loadHistory();
      } catch (error) {
        console.error('清空历史记录失败:', error);
        alert('清空历史记录失败');
      }
    }
  };

  /**
   * 格式化时间
   */
  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN');
  };

  /**
   * 获取状态显示信息
   */
  const getStatusInfo = (status: CartHistoryItem['status']) => {
    return STATUS_INFO[status] || STATUS_INFO.pending;
  };

  /**
   * 组件挂载时加载数据
   */
  useEffect(() => {
    loadHistory();
  }, [qqNumber, phoneNumber]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">我的预订历史</h1>
            <p className="text-slate-600 mt-1">
              QQ: {qqNumber} | 手机: {phoneNumber}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadHistory}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              刷新
            </button>
            {history.totalRecords > 0 && (
              <button
                onClick={handleClearAllHistory}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                清空全部
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      {history.totalRecords > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{history.totalRecords}</div>
              <div className="text-sm text-slate-600">总预订次数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {history.records.reduce((sum, record) => sum + record.totalQuantity, 0)}
              </div>
              <div className="text-sm text-slate-600">总预订数量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                ¥{history.records.reduce((sum, record) => sum + record.totalPrice, 0)}
              </div>
              <div className="text-sm text-slate-600">总预订金额</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {history.records.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm text-slate-600">已完成</div>
            </div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400 mr-3 flex-shrink-0">
              <XCircle size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-red-800">加载失败</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 历史记录列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
            <RefreshCw size={40} className="text-slate-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">加载中...</h3>
            <p className="text-slate-600">正在获取您的预订历史记录</p>
          </div>
        ) : history.totalRecords === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
            <Calendar size={40} className="text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">暂无预订历史</h3>
            <p className="text-slate-600">您还没有提交过任何预订</p>
          </div>
        ) : (
          history.records.map((record) => {
            const statusInfo = getStatusInfo(record.status);
            
            return (
              <div key={record.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package size={20} className="text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-slate-800">
                          预订记录 #{record.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-slate-600">
                          提交时间：{formatTime(record.submittedAt)}
                        </p>
                        <p className="text-sm text-slate-600">
                          总数量：{record.totalQuantity} | 总金额：¥{record.totalPrice}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      {record.bookingIds && record.bookingIds.length > 0 && (
                        <p className="text-sm text-slate-500 mt-1">
                          预订ID: {record.bookingIds.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* 商品列表 */}
                  <div className="space-y-3 mb-4">
                    {record.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <img
                          src={item.collection.coverImage}
                          alt={item.collection.title}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-slate-800 truncate">
                            {item.collection.title}
                          </h4>
                          <p className="text-sm text-slate-600">
                            编号：{item.collection.number} | 数量：{item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-800">
                            ¥{(item.collection.price || 0) * item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 备注信息 */}
                  {record.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-500">备注</p>
                      <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg break-words">
                        {record.notes}
                      </p>
                    </div>
                  )}
                  
                  {/* 操作按钮 */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                      <Eye size={16} />
                      查看详情
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={16} />
                      删除记录
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 详情弹窗 */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">预订详情</h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">基本信息</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-slate-500">记录ID</p>
                      <p className="font-medium text-slate-800">{selectedRecord.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">提交时间</p>
                      <p className="font-medium text-slate-800">{formatTime(selectedRecord.submittedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">QQ号</p>
                      <p className="font-medium text-slate-800">{selectedRecord.qqNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">手机号</p>
                      <p className="font-medium text-slate-800">{selectedRecord.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">状态</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(selectedRecord.status).color}`}>
                        {getStatusInfo(selectedRecord.status).label}
                      </span>
                    </div>
                    {selectedRecord.bookingIds && selectedRecord.bookingIds.length > 0 && (
                      <div>
                        <p className="text-sm text-slate-500">预订ID</p>
                        <p className="font-medium text-slate-800">{selectedRecord.bookingIds.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 商品详情 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">商品详情</h3>
                  <div className="space-y-3">
                    {selectedRecord.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <img
                          src={item.collection.coverImage}
                          alt={item.collection.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-slate-800">{item.collection.title}</h4>
                          <p className="text-sm text-slate-600">编号：{item.collection.number}</p>
                          <p className="text-sm text-slate-600">单价：¥{item.collection.price || '待定'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-800">数量：{item.quantity}</p>
                          <p className="font-medium text-slate-800">
                            小计：¥{(item.collection.price || 0) * item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 备注信息 */}
                {selectedRecord.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">备注信息</h3>
                    <p className="text-slate-800 bg-slate-50 p-4 rounded-lg break-words">
                      {selectedRecord.notes}
                    </p>
                  </div>
                )}
                
                {/* 总计信息 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">总计信息</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-slate-500">总数量</p>
                      <p className="font-medium text-slate-800">{selectedRecord.totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">总金额</p>
                      <p className="font-medium text-slate-800">¥{selectedRecord.totalPrice}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 