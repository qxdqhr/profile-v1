/**
 * ShowMasterpiece 模块 - 购物车管理面板组件
 * 
 * 管理员查看所有用户购物车数据的面板组件
 * 
 * @fileoverview 购物车管理面板组件
 */

'use client';

import React, { useState } from 'react';
import { ShoppingCart, User, Package, Clock, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import { CartAdminData, CartAdminStats } from '../services/cartAdminService';
import styles from './CartAdminPanel.module.css';

/**
 * 购物车管理面板组件属性
 */
interface CartAdminPanelProps {
  /** 购物车数据列表 */
  carts: CartAdminData[];
  /** 统计信息 */
  stats: CartAdminStats;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error?: string;
  /** 刷新数据回调 */
  onRefresh: () => void;
}

/**
 * 购物车管理面板组件
 * 
 * @param props 组件属性
 * @returns React组件
 */
export const CartAdminPanel: React.FC<CartAdminPanelProps> = ({
  carts,
  stats,
  loading,
  error,
  onRefresh,
}) => {
  const [selectedCart, setSelectedCart] = useState<CartAdminData | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'converted' | 'abandoned'>('all');

  /**
   * 获取状态显示信息
   */
  const getStatusInfo = (status: string, isExpired: boolean) => {
    if (isExpired) {
      return { icon: Clock, label: '已过期', color: 'text-gray-500' };
    }
    
    switch (status) {
      case 'active':
        return { icon: Package, label: '活跃', color: 'text-blue-600' };
      case 'converted':
        return { icon: CheckCircle, label: '已转换', color: 'text-green-600' };
      case 'abandoned':
        return { icon: XCircle, label: '已放弃', color: 'text-red-600' };
      default:
        return { icon: Package, label: '未知', color: 'text-gray-500' };
    }
  };

  /**
   * 过滤购物车数据
   */
  const filteredCarts = carts.filter(cart => {
    if (filterStatus === 'all') return true;
    return cart.status === filterStatus;
  });

  /**
   * 格式化时间
   */
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('zh-CN');
  };

  /**
   * 获取用户显示名称
   */
  const getUserDisplayName = (user: CartAdminData['user']) => {
    if (!user) return '未知用户';
    return user.name || user.phone || `用户${user.id}`;
  };

  return (
    <div className={styles.container}>
      {/* 统计卡片 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ShoppingCart size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.totalCarts}</h3>
            <p className={styles.statLabel}>总购物车数</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.active}`}>
            <Package size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.activeCarts}</h3>
            <p className={styles.statLabel}>活跃购物车</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.converted}`}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.convertedCarts}</h3>
            <p className={styles.statLabel}>已转换</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.abandoned}`}>
            <XCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.abandonedCarts}</h3>
            <p className={styles.statLabel}>已放弃</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.expired}`}>
            <Clock size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.expiredCarts}</h3>
            <p className={styles.statLabel}>已过期</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.items}`}>
            <Package size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.totalQuantity}</h3>
            <p className={styles.statLabel}>总商品数量</p>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className={styles.actionBar}>
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filterStatus === 'all' ? styles.active : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            全部
          </button>
          <button
            className={`${styles.filterButton} ${filterStatus === 'active' ? styles.active : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            活跃
          </button>
          <button
            className={`${styles.filterButton} ${filterStatus === 'converted' ? styles.active : ''}`}
            onClick={() => setFilterStatus('converted')}
          >
            已转换
          </button>
          <button
            className={`${styles.filterButton} ${filterStatus === 'abandoned' ? styles.active : ''}`}
            onClick={() => setFilterStatus('abandoned')}
          >
            已放弃
          </button>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={loading}
          className={styles.refreshButton}
        >
          <RefreshCw size={16} className={loading ? styles.spinning : ''} />
          刷新
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
        </div>
      )}

      {/* 购物车列表 */}
      <div className={styles.cartList}>
        {filteredCarts.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingCart size={48} className={styles.emptyIcon} />
            <h3>暂无购物车数据</h3>
            <p>当前筛选条件下没有找到购物车数据</p>
          </div>
        ) : (
          filteredCarts.map((cart) => {
            const statusInfo = getStatusInfo(cart.status, cart.isExpired);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={cart.id} className={styles.cartCard}>
                <div className={styles.cartHeader}>
                  <div className={styles.cartInfo}>
                    <div className={styles.userInfo}>
                      <User size={16} />
                      <span className={styles.userName}>
                        {getUserDisplayName(cart.user)}
                      </span>
                      {cart.user && (
                        <span className={styles.userPhone}>
                          ({cart.user.phone})
                        </span>
                      )}
                    </div>
                    
                    <div className={styles.cartMeta}>
                      <span className={`${styles.status} ${statusInfo.color}`}>
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </span>
                      <span className={styles.cartId}># {cart.id}</span>
                    </div>
                  </div>
                  
                  <div className={styles.cartStats}>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>商品数:</span>
                      <span className={styles.statValue}>{cart.itemCount}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>总数量:</span>
                      <span className={styles.statValue}>{cart.totalQuantity}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>总价格:</span>
                      <span className={styles.statValue}>¥{cart.totalPrice}</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.cartItems}>
                  {cart.items.length === 0 ? (
                    <p className={styles.noItems}>购物车为空</p>
                  ) : (
                    <div className={styles.itemsGrid}>
                      {cart.items.slice(0, 3).map((item) => (
                        <div key={item.id} className={styles.itemCard}>
                          <img
                            src={item.collection.coverImage}
                            alt={item.collection.title}
                            className={styles.itemImage}
                          />
                          <div className={styles.itemInfo}>
                            <h4 className={styles.itemTitle}>{item.collection.title}</h4>
                            <p className={styles.itemArtist}>{item.collection.artist}</p>
                            <p className={styles.itemQuantity}>数量: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {cart.items.length > 3 && (
                        <div className={styles.moreItems}>
                          <span>还有 {cart.items.length - 3} 个商品...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className={styles.cartFooter}>
                  <div className={styles.cartDates}>
                    <span>创建: {formatTime(cart.createdAt)}</span>
                    <span>更新: {formatTime(cart.updatedAt)}</span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedCart(cart)}
                    className={styles.viewButton}
                  >
                    <Eye size={16} />
                    查看详情
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 购物车详情弹窗 */}
      {selectedCart && (
        <div className={styles.modalOverlay} onClick={() => setSelectedCart(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>购物车详情</h2>
              <button
                onClick={() => setSelectedCart(null)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.detailSection}>
                <h3>用户信息</h3>
                <p>用户: {getUserDisplayName(selectedCart.user)}</p>
                {selectedCart.user && (
                  <>
                    <p>手机: {selectedCart.user.phone}</p>
                    {selectedCart.user.email && <p>邮箱: {selectedCart.user.email}</p>}
                  </>
                )}
              </div>
              
              <div className={styles.detailSection}>
                <h3>购物车信息</h3>
                <p>ID: {selectedCart.id}</p>
                <p>状态: {getStatusInfo(selectedCart.status, selectedCart.isExpired).label}</p>
                <p>创建时间: {formatTime(selectedCart.createdAt)}</p>
                <p>更新时间: {formatTime(selectedCart.updatedAt)}</p>
                {selectedCart.expiresAt && (
                  <p>过期时间: {formatTime(selectedCart.expiresAt)}</p>
                )}
              </div>
              
              <div className={styles.detailSection}>
                <h3>商品列表 ({selectedCart.items.length})</h3>
                <div className={styles.detailItems}>
                  {selectedCart.items.map((item) => (
                    <div key={item.id} className={styles.detailItem}>
                      <img
                        src={item.collection.coverImage}
                        alt={item.collection.title}
                        className={styles.detailItemImage}
                      />
                      <div className={styles.detailItemInfo}>
                        <h4>{item.collection.title}</h4>
                        <p>艺术家: {item.collection.artist}</p>
                        <p>数量: {item.quantity}</p>
                        <p>添加时间: {formatTime(item.addedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 