/**
 * ShowMasterpiece 主页面组件 - Tailwind CSS 版本
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
 * - 使用 Tailwind CSS 进行样式管理
 * 
 * @component
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { useMasterpieces } from '../hooks/useMasterpieces';
import { getConfig } from '../services/masterpiecesConfigService';
import { MasterpiecesConfig, CollectionCategory, CollectionCategoryType } from '../types';
import { CollectionCard, ArtworkViewer, ThumbnailSidebar, CartModal, CartButton } from '../components';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider, useAuth, UserMenu, CustomMenuItem } from '@/modules/auth';

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
  
  /** 购物车弹窗状态 */
  const [cartModalOpen, setCartModalOpen] = useState(false);
  
  /** 当前选中的分类 */
  const [selectedCategory, setSelectedCategory] = useState<CollectionCategoryType | 'all'>('all');

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

  // ===== 数据过滤 =====
  
  /**
   * 根据选中的分类过滤画集
   * 使用 useMemo 缓存过滤结果，避免重复计算
   */
  const filteredCollections = useMemo(() => {
    if (selectedCategory === 'all') {
      return collections;
    }
    return collections.filter(collection => collection.category === selectedCategory);
  }, [collections, selectedCategory]);

  // ===== 权限控制 =====
  
  /**
   * 使用 useMemo 缓存权限检查结果，避免重复计算
   * 
   * 权限判断逻辑：
   * - 必须已登录
   * - 用户角色为admin，或者
   * - 用户ID为1（临时管理员）
   */
  const hasAdminAccess = useMemo(() => {
    return isAuthenticated && (user?.role === 'admin' || user?.id === 1);
  }, [isAuthenticated, user?.role, user?.id]);

  // ===== 事件处理函数 =====
  
  /**
   * 处理配置按钮点击事件
   * 检查权限后跳转到配置页面
   */
  const handleConfigClick = () => {
    if (!hasAdminAccess) {
      alert('需要管理员权限才能访问配置页面');
      return;
    }
    window.location.href = '/testField/ShowMasterPieces/config';
  };

  /**
   * 处理购物车按钮点击事件
   * 打开购物车弹窗
   */
  const handleCartClick = () => {
    setCartModalOpen(true);
  };

  // ===== 渲染函数 =====
  
  /**
   * 渲染加载状态
   */
  const renderLoading = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 overflow-x-hidden">
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-600">加载中...</p>
      </div>
    </div>
  );

  /**
   * 渲染错误状态
   */
  const renderError = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 overflow-x-hidden">
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-4 text-center">
        <p className="text-red-600 text-lg">加载失败：{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors min-h-[44px]"
        >
          重试
        </button>
      </div>
    </div>
  );

  /**
   * 渲染空状态
   */
  const renderEmptyState = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 overflow-x-hidden">
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-4 text-center">
        <div className="text-slate-400 text-6xl mb-4">🎨</div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">暂无可用画集</h3>
        <p className="text-slate-600 mb-6">当前没有可预订的画集，请稍后再试</p>
        {hasAdminAccess && (
          <a
            href="/testField/ShowMasterPieces/config"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Settings size={20} />
            前往配置页面
          </a>
        )}
      </div>
    </div>
  );

  // ===== 主渲染逻辑 =====
  
  // 加载状态
  if (loading) {
    return renderLoading();
  }

  // 错误状态
  if (error) {
    return renderError();
  }

  // 空状态
  if (!collections || collections.length === 0) {
    return renderEmptyState();
  }

  // 获取用户ID，临时默认为1（应该要求登录）
  const userId = user?.id || 1;

  return (
    <CartProvider userId={userId}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 overflow-x-hidden">
        {/* 顶部导航 */}
        <div className="bg-white shadow-md border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4 min-h-[44px]">
              {/* 左侧：返回按钮和标题 */}
              <div className="flex items-center gap-4 sm:gap-8 min-w-0 flex-1">
                {selectedCollection && (
                  <button
                    onClick={backToGallery}
                    className="flex items-center gap-1 sm:gap-2 text-slate-500 bg-transparent border-none cursor-pointer text-base transition-colors hover:text-slate-800 p-1 sm:p-2 rounded-lg min-h-[44px] min-w-[44px] flex-shrink-0"
                  >
                    <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">返回</span>
                  </button>
                )}
                <div className="text-center sm:text-left min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 m-0 truncate">
                    {config?.heroTitle || '艺术画集展览'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 m-0 hidden sm:block truncate">
                    {config?.heroSubtitle || '探索精美的艺术作品，感受创作的魅力'}
                  </p>
                </div>
              </div>

              {/* 右侧：用户菜单和操作按钮 */}
              <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                {/* 购物车按钮 */}
                <CartButton 
                  onClick={handleCartClick} 
                  className="relative p-1 sm:p-2 text-slate-600 hover:text-slate-800 transition-colors" 
                  userId={userId}
                />
                
                {/* 用户菜单 */}
                <UserMenu 
                  customMenuItems={hasAdminAccess ? [
                    {
                      id: 'showmasterpiece-admin',
                      label: '画集管理',
                      icon: Settings,
                      onClick: handleConfigClick,
                      requireAuth: true
                    }
                  ] : []}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
          {selectedCollection ? (
            /* 作品浏览视图 */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* 侧边栏：缩略图导航 */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <ThumbnailSidebar
                  pages={selectedCollection.pages}
                  currentPage={currentPage}
                  onPageSelect={goToPage}
                />
              </div>
              
              {/* 主内容区：作品查看器 */}
              <div className="lg:col-span-3 order-1 lg:order-2">
                {getCurrentArtwork() && (
                  <ArtworkViewer
                    artwork={getCurrentArtwork()!}
                    collectionId={selectedCollection.id}
                    onNext={nextPage}
                    onPrev={prevPage}
                    canGoNext={canGoNext}
                    canGoPrev={canGoPrev}
                  />
                )}
              </div>
            </div>
          ) : (
            /* 画集列表视图 */
            <div className="space-y-6">
              {/* 分类Tab栏 */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>全部</span>
                    <span className="ml-1 text-xs opacity-90">({collections.length})</span>
                  </button>
                  <button
                    onClick={() => setSelectedCategory(CollectionCategory.COLLECTION)}
                    className={`flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                      selectedCategory === CollectionCategory.COLLECTION
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>画集</span>
                    <span className="ml-1 text-xs opacity-90">({collections.filter(c => c.category === CollectionCategory.COLLECTION).length})</span>
                  </button>
                  <button
                    onClick={() => setSelectedCategory(CollectionCategory.PRODUCT)}
                    className={`flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                      selectedCategory === CollectionCategory.PRODUCT
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>商品</span>
                    <span className="ml-1 text-xs opacity-90">({collections.filter(c => c.category === CollectionCategory.PRODUCT).length})</span>
                  </button>
                </div>
              </div>

              {/* 画集网格 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredCollections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    userId={userId}
                    onSelect={selectCollection}
                  />
                ))}
              </div>
              
              {/* 空状态提示 */}
              {filteredCollections.length === 0 && collections.length > 0 && (
                <div className="text-center py-8 sm:py-12 px-4">
                  <div className="text-slate-400 text-base sm:text-lg mb-2">
                    当前分类暂无内容
                  </div>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    请尝试选择其他分类查看
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 购物车弹窗 */}
        <CartModal 
          isOpen={cartModalOpen} 
          onClose={() => setCartModalOpen(false)} 
          title="购物车" 
          userId={userId}
        />
      </div>
    </CartProvider>
  );
}

/**
 * ShowMasterpiece 主组件
 * 
 * 提供认证上下文包装器，确保组件能够访问用户认证状态。
 * 
 * @returns React函数组件
 */
export default function ShowMasterPieces() {
  return (
    <AuthProvider>
      <ShowMasterPiecesContent />
    </AuthProvider>
  );
} 