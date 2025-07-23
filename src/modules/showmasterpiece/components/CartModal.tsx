/**
 * ShowMasterpiece 模块 - 购物车弹窗组件
 * 
 * 使用现有的Modal组件包装购物车页面，提供弹窗形式的购物车功能
 * 
 * @fileoverview 购物车弹窗组件
 */

'use client';

import React from 'react';
import { Modal } from '@/components/PopWindow';
import { CartPage } from './CartPage';

/**
 * 购物车弹窗组件属性
 */
interface CartModalProps {
  /** 用户ID */
  userId: number;
  
  /** 是否显示弹窗 */
  isOpen: boolean;
  
  /** 关闭弹窗回调 */
  onClose: () => void;
  
  /** 弹窗标题 */
  title?: string;
  
  /** 弹窗宽度 */
  width?: number | string;
  
  /** 弹窗高度 */
  height?: number | string;
}

/**
 * 购物车弹窗组件
 * 
 * @param props 组件属性
 * @returns React组件
 */
export const CartModal: React.FC<CartModalProps> = ({
  userId,
  isOpen,
  onClose,
  title = '购物车',
  width = '90vw',
  height = '90vh',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="95vw"
      height="95vh"
      maskClosable={false}
      showCloseButton={true}
      className="max-w-6xl sm:max-w-4xl"
      contentClassName="p-0 overflow-hidden"
    >
      <CartPage userId={userId} onClose={onClose} />
    </Modal>
  );
}; 