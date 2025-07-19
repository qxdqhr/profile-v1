/**
 * ShowMasterpiece 主页面组件
 * 
 * 这是ShowMasterpiece模块的主要页面组件，提供完整的画集浏览体验。
 * 支持两种视图模式：画集列表视图和作品详情视图。
 * 
 * 主要功能：
 * - 画集列表展示和搜索
 * - 画集详情浏览和作品查看
 * - 用户权限控制和认证
 * - 响应式设计和优化的用户体验
 * - 配置管理入口（需要管理员权限）
 * 
 * 技术特点：
 * - 使用自定义Hook进行状态管理
 * - 集成认证系统，支持权限控制
 * - 动态配置加载，支持个性化设置
 * - 性能优化：使用useMemo缓存计算结果
 * 
 * @component
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Settings, ShoppingCart } from 'lucide-react';
import { useMasterpieces } from '../hooks/useMasterpieces';
import { getConfig } from '../services/masterpiecesConfigService';
import { MasterpiecesConfig } from '../types';
import { CollectionCard, ArtworkViewer, ThumbnailSidebar, BookingModal } from '../components';
import { AuthProvider, useAuth, UserMenu, CustomMenuItem } from '@/modules/auth';
import styles from './ShowMasterPieces.module.css';

/**
 * ShowMasterpiece 内容组件
 * 
 * 主要的业务逻辑组件，包含状态管理和视图渲染。
 * 需要在AuthProvider包装器内使用，以便访问认证状态。
 * 
 * @returns React函数组件
 */
function ShowMasterPiecesContent() {
  // ===== Hooks和状态管理 =====
  
  /**
   * 使用自定义Hook管理画集数据和浏览状态
   * 包含画集列表、当前选中画集、翻页操作等
   */
  const {
    collections,        // 所有画集数据
    selectedCollection,  // 当前选中的画集
    currentPage,        // 当前作品页面索引
    loading,            // 数据加载状态
    error,              // 错误信息
    getCurrentArtwork,  // 获取当前作品的方法
    canGoNext,          // 是否可以下一页
    canGoPrev,          // 是否可以上一页
    selectCollection,   // 选择画集的方法
    nextPage,           // 下一页方法
    prevPage,           // 上一页方法
    goToPage,           // 跳转到指定页面的方法
    backToGallery,      // 返回画集列表的方法
  } = useMasterpieces();

  /** 获取用户认证状态和信息 */
  const { isAuthenticated, user } = useAuth();
  
  /** 系统配置状态 */
  const [config, setConfig] = useState<MasterpiecesConfig | null>(null);
  
  /** 预订弹窗状态 */
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // ===== 配置加载 =====
  
  /**
   * 组件挂载时加载系统配置
   * 配置信息用于自定义页面标题、副标题等显示内容
   */
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configData = await getConfig();
        setConfig(configData);
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    };
    loadConfig();
  }, []);

  // ===== 权限控制 =====
  
  /**
   * 使用 useMemo 缓存权限检查结果，避免重复计算
   * 
   * 权限判断逻辑：
   * - 必须已登录
   * - 用户角色为admin，或者
   * - 特定手机号用户（临时方案）
   */
  const hasConfigPermission = useMemo(() => {
    if (!isAuthenticated || !user) {
      return false;
    }
    
    // 基于用户角色或手机号判断
    return user.role === 'admin';
  }, [isAuthenticated, user]);

  // ===== 事件处理 =====
  
  /**
   * 处理配置页面访问请求
   * 
   * 检查用户权限，有权限则跳转到配置页面，
   * 无权限则提示用户登录。
   */
  const handleConfigClick = () => {
    console.log('🎯 [ShowMasterPieces] handleConfigClick 被调用');
    console.log('🔐 [ShowMasterPieces] 当前认证状态:', { isAuthenticated, user });
    
    if (hasConfigPermission) {
      console.log('✅ [ShowMasterPieces] 用户已认证，跳转到配置页面');
      window.location.href = '/testField/ShowMasterPieces/config';
    } else {
      console.log('❌ [ShowMasterPieces] 用户未认证，需要先登录');
      alert('请先登录后访问配置页面');
    }
  };

  /**
   * 处理预订按钮点击
   * 
   * 打开预订弹窗
   */
  const handleBookingClick = () => {
    setBookingModalOpen(true);
  };

  // ===== 自定义菜单配置 =====
  
  /**
   * 自定义菜单项配置
   * 只有有权限的用户才会显示配置菜单项
   */
  const customMenuItems: CustomMenuItem[] = useMemo(() => {
    if (!hasConfigPermission) {
      return [];
    }
    
    return [{
      id: 'config',
      label: '配置',
      icon: Settings,
      onClick: handleConfigClick,
      requireAuth: true
    }];
  }, [hasConfigPermission]);

  // ===== 渲染逻辑 =====
  
  /**
   * 加载状态渲染
   * 显示loading spinner和提示文字
   */
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  /**
   * 错误状态渲染
   * 显示错误信息和重新加载按钮
   */
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>重新加载</button>
        </div>
      </div>
    );
  }

  /**
   * 画集详情视图渲染
   * 
   * 当用户选择了某个画集时，显示该画集的详细内容，包括：
   * - 顶部导航栏（返回按钮、画集标题、用户菜单）
   * - 主要内容区域（作品查看器）
   * - 侧边栏（缩略图导航）
   */
  if (selectedCollection) {
    const currentArtwork = getCurrentArtwork();
    
    return (
      <div className={styles.container}>
        {/* 顶部导航栏 */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerNav}>
              {/* 返回画集列表按钮 */}
              <button onClick={backToGallery} className={styles.backButton}>
                <ArrowLeft size={20} />
                <span>返回画集</span>
              </button>
              
              {/* 画集标题和作者信息 */}
              <div className={styles.headerTitle}>
                <h1>{selectedCollection.title}</h1>
                <p>作者：{selectedCollection.artist}</p>
              </div>
              
              {/* 用户菜单 */}
              <UserMenu customMenuItems={customMenuItems} />
            </div>
          </div>
        </div>

        {/* 作品展示区域 */}
        <div className={styles.artworkContainer}>
          {/* 主要内容区域 - 作品查看器 */}
          <div className={styles.artworkMain}>
            {currentArtwork && (
              <ArtworkViewer
                artwork={currentArtwork}
                collectionId={selectedCollection.id}
                onNext={nextPage}
                onPrev={prevPage}
                canGoNext={canGoNext}
                canGoPrev={canGoPrev}
              />
            )}
          </div>
          
          {/* 侧边栏 - 缩略图导航 */}
          <div className={styles.artworkSidebar}>
            <ThumbnailSidebar
              pages={selectedCollection.pages}
              currentPage={currentPage}
              onPageSelect={goToPage}
            />
          </div>
        </div>
      </div>
    );
  }

  /**
   * 画集列表视图渲染
   * 
   * 显示所有可用的画集，以网格形式展示画集卡片，包括：
   * - 顶部导航栏（返回按钮、页面标题、用户菜单）
   * - 画集网格（使用CollectionCard组件）
   * - 空状态处理（无画集时的提示）
   */
  return (
    <div className={styles.container}>
      {/* 顶部导航栏 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerNav}>
            {/* 返回上级页面按钮 */}
            <button
              onClick={() => window.history.back()}
              className={styles.backButton}
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>
            
            {/* 页面标题和副标题（从配置中获取） */}
            <div className={styles.headerTitle}>
              <h1>{config?.heroTitle || '艺术画集展览馆'}</h1>
              <p>{config?.heroSubtitle || '精选世界各地艺术大师的经典作品，每一页都是一次艺术的沉浸体验'}</p>
            </div>
            
            {/* 预订按钮 */}
            <button
              onClick={handleBookingClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <ShoppingCart size={16} />
              <span>预订画集</span>
            </button>
            
            {/* 用户菜单 */}
            <UserMenu customMenuItems={customMenuItems} />
          </div>
        </div>
      </div>

      {/* 画集网格容器 */}
      <div className={styles.collectionsContainer}>
        <div className={styles.collectionsGrid}>
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onSelect={selectCollection}
            />
          ))}
        </div>
      </div>

      {/* 空状态提示 */}
      {collections.length === 0 && (
        <div className={styles.emptyState}>
          <h3>暂无画集</h3>
          <p>请前往配置页面添加画集</p>
          <button 
            onClick={handleConfigClick}
            className={styles.configLink}
          >
            {hasConfigPermission ? '前往配置' : '请先登录'}
          </button>
        </div>
      )}
      
      {/* 预订弹窗 */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="预订画集"
      />
    </div>
  );
}

/**
 * ShowMasterpiece 主页面组件（带认证包装器）
 * 
 * 这是对外导出的主组件，包装了AuthProvider以提供认证上下文。
 * 确保所有子组件都能访问用户认证状态和相关功能。
 * 
 * @returns React函数组件（包含认证提供者）
 */
export default function ShowMasterPieces() {
  return (
    // <AuthProvider>
      <ShowMasterPiecesContent />
    // </AuthProvider>
  );
}
