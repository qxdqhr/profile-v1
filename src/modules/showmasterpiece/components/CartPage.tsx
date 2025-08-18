/**
 * ShowMasterpiece 模块 - 购物车页面组件
 * 
 * 完整的购物车页面，包含：
 * - 购物车商品列表展示
 * - 商品数量调整
 * - 商品移除功能
 * - 批量预订表单
 * - 提交和状态管理
 * 
 * @fileoverview 购物车页面组件
 */

'use client';

import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../types/cart';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

/**
 * 购物车页面组件属性
 */
interface CartPageProps {
  /** 用户ID */
  userId: number;
  
  /** 关闭回调 */
  onClose?: () => void;
}

/**
 * 购物车页面组件
 * 
 * @param props 组件属性
 * @returns React组件
 */
export const CartPage: React.FC<CartPageProps> = ({ userId, onClose }) => {
  // 使用购物车Hook
  const {
    cart,
    loading,
    error,
    updateItemQuantity,
    removeItemFromCart,
    clearCartItems,
    checkoutCart,
    clearError,
  } = useCart(userId);

  // 本地状态
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [formData, setFormData] = useState({
    qqNumber: '',
    phoneNumber: '',
    notes: '',
    pickupMethod: '',
  });
  const [formErrors, setFormErrors] = useState<{
    qqNumber?: string;
    phoneNumber?: string;
    notes?: string;
    pickupMethod?: string;
  }>({});

  /**
   * 处理表单字段更新
   */
  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的错误
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * 验证表单
   */
  const validateForm = (): boolean => {
    const errors: { qqNumber?: string; phoneNumber?: string; notes?: string; pickupMethod?: string } = {};

    // 验证QQ号（必填）
    if (!formData.qqNumber.trim()) {
      errors.qqNumber = '请输入QQ号';
    } else if (!/^\d{5,11}$/.test(formData.qqNumber.trim())) {
      errors.qqNumber = 'QQ号格式不正确';
    }

    // 验证手机号（必填）
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = '请输入手机号';
    } else {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(formData.phoneNumber.trim())) {
        errors.phoneNumber = '手机号格式不正确';
      }
    }

    // 验证备注信息（必填）
    if (!formData.notes.trim()) {
      errors.notes = '请填写备注信息';
    }

    // 验证领取方式（必填）
    if (!formData.pickupMethod.trim()) {
      errors.pickupMethod = '请填写领取方式';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * 处理批量预订提交
   */
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsCheckingOut(true);
    clearError();
    
    try {
      const result = await checkoutCart(formData.qqNumber, formData.phoneNumber, formData.notes || undefined, formData.pickupMethod);
      setCheckoutSuccess(true);
    } catch (error) {
      console.error('批量预订失败:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  /**
   * 处理重新购物
   */
  const handleContinueShopping = () => {
    setCheckoutSuccess(false);
    setFormData({ qqNumber: '', phoneNumber: '', notes: '', pickupMethod: '' });
    setFormErrors({});
    if (onClose) {
      onClose();
    }
  };

  /**
   * 成功状态渲染
   */
  if (checkoutSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">批量预订提交成功！</h2>
          <p className="text-gray-600 mb-6">
            您的批量预订已成功提交，我们会尽快与您联系确认。
          </p>
          <button
            onClick={handleContinueShopping}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            继续购物
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6">
      {/* 页面标题 */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">购物车</h1>
        <p className="text-sm sm:text-base text-gray-600">管理您选择的画集，确认后批量预订</p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex">
            <div className="text-red-400 mr-3 flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-red-800">操作失败</h3>
              <p className="text-sm text-red-700 mt-1 break-words">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 购物车为空状态 */}
      {cart.items.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12">
          <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">购物车为空</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">您还没有添加任何画集到购物车</p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-base"
          >
            继续浏览画集
          </button>
        </div>
      )}

      {/* 购物车商品列表 */}
      {cart.items.length > 0 && (
        <div className="space-y-6">
          {/* 商品列表 */}
          <div className="bg-white rounded-lg shadow-sm border">
            {cart.items.map((item: CartItem) => (
              <div key={item.collectionId} className="flex flex-col sm:flex-row items-start sm:items-center p-3 sm:p-4 border-b last:border-b-0 gap-3 sm:gap-4">
                {/* 商品图片 */}
                <img
                  src={item.collection.coverImage}
                  alt={item.collection.title}
                  className="w-16 h-16 sm:w-16 sm:h-16 object-cover rounded-md flex-shrink-0"
                />
                
                {/* 商品信息 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">{item.collection.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">编号：{item.collection.number}</p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    价格：{(item.collection as any).price ? `¥${(item.collection as any).price}` : '价格待定'}
                  </p>
                </div>
                
                {/* 数量控制和小计 - 移动端垂直布局 */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  {/* 数量控制 */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateItemQuantity(item.collectionId, item.quantity - 1)}
                      disabled={loading}
                      className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Minus size={18} className="sm:w-4 sm:h-4" />
                    </button>
                    <span className="w-16 sm:w-12 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                    <button
                      onClick={() => updateItemQuantity(item.collectionId, item.quantity + 1)}
                      disabled={loading}
                      className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Plus size={18} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  
                  {/* 小计 */}
                  <div className="text-center sm:text-right">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      ¥{((item.collection as any).price || 0) * item.quantity}
                    </p>
                  </div>
                </div>
                
                {/* 删除按钮 */}
                <button
                  onClick={() => removeItemFromCart(item.collectionId)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50 p-2 sm:p-1"
                >
                  <Trash2 size={20} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* 购物车统计 */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm sm:text-base text-gray-600">商品总数：</span>
              <span className="text-sm sm:text-base font-semibold">{cart.totalQuantity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-600">总价格：</span>
              <span className="text-lg sm:text-xl font-bold text-blue-600">¥{cart.totalPrice}</span>
            </div>
          </div>

          {/* 批量预订表单 */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">批量预订信息</h3>
            
            <form onSubmit={handleCheckout} className="space-y-4">
              {/* QQ号输入 */}
              <div>
                <label htmlFor="qqNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  QQ号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="qqNumber"
                  value={formData.qqNumber}
                  onChange={(e) => handleFormChange('qqNumber', e.target.value)}
                  className={`w-full px-3 py-3 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${
                    formErrors.qqNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="请输入您的QQ号"
                  disabled={isCheckingOut}
                />
                {formErrors.qqNumber && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.qqNumber}</p>
                )}
              </div>

              {/* 手机号输入 */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  手机号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                  className={`w-full px-3 py-3 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${
                    formErrors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="请输入您的手机号"
                  disabled={isCheckingOut}
                />
                {formErrors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                )}
              </div>

              {/* 备注信息 */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  备注信息 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  rows={8}
                  className={`w-full px-3 py-3 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[160px] sm:min-h-[140px] ${
                    formErrors.notes ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={`您在葱韵环京的哪个群（方便我们联系您）
（1）葱韵环京ComicUniverse
（2）葱韵环京外星开拓群
（3）葱韵环京比邻星
（4）葱韵环京华东群
（5）葱韵环京天津群`}
                  disabled={isCheckingOut}
                />
                {formErrors.notes && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.notes}</p>
                )}
              </div>

              {/* 领取方式 */}
              <div>
                <label htmlFor="pickupMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  领取方式 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="pickupMethod"
                  value={formData.pickupMethod}
                  onChange={(e) => handleFormChange('pickupMethod', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-3 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[120px] ${
                    formErrors.pickupMethod ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={`是否到9.13北京场现场领取（天津/南京场暂不设置现场领取点）
【1】是（现场领）
【2】否（邮寄）`}
                  disabled={isCheckingOut}
                />
                {formErrors.pickupMethod && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.pickupMethod}</p>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={clearCartItems}
                  disabled={loading || isCheckingOut}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 sm:py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-base"
                >
                  清空购物车
                </button>
                <button
                  type="submit"
                  disabled={loading || isCheckingOut || cart.items.length === 0}
                  className={`flex-1 py-3 sm:py-2 px-4 rounded-lg font-medium transition-colors text-base ${
                    loading || isCheckingOut || cart.items.length === 0
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isCheckingOut ? '提交中...' : '批量预订'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">加载中...</p>
        </div>
      )}
    </div>
  );
}; 