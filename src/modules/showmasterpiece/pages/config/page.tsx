'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Database, Image, Tag, Save, RotateCcw, Plus, Edit, Trash2, ArrowUpDown, ShoppingCart } from 'lucide-react';
import { useMasterpiecesConfig } from '../../hooks/useMasterpiecesConfig';
import { ConfigFormData, CollectionFormData, ArtworkFormData, CollectionCategory, CollectionCategoryType, getAvailableCategories, getCategoryDisplayName } from '../../types';
import { UniversalImageUpload } from '../../components/UniversalImageUpload';
import { shouldUseUniversalFileService, getStorageModeDisplayName } from '../../services/fileService';
import { AuthGuard, AuthProvider } from '@/modules/auth';
import { CollectionOrderManagerV2 as CollectionOrderManager } from '../../components/CollectionOrderManagerV2';
import { ArtworkOrderManagerV2 as ArtworkOrderManager } from '../../components/ArtworkOrderManagerV2';
import { CartAdminPanel } from '../../components/CartAdminPanel';
import { useCartAdmin } from '../../hooks/useCartAdmin';

type TabType = 'general' | 'collections' | 'artworks' | 'carts';

function ConfigPageContent() {
  const {
    config,
    collections,
    categories,
    tags,
    loading,
    error,
    updateConfig,
    resetConfig,
    createCollection,
    updateCollection,
    deleteCollection,
    addArtworkToCollection,
    updateArtwork,
    deleteArtwork,
    refreshData,
  } = useMasterpiecesConfig();

  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [showArtworkForm, setShowArtworkForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<number | null>(null);
  const [editingArtwork, setEditingArtwork] = useState<{ collectionId: number; artworkId: number } | null>(null);
  const [showArtworkOrder, setShowArtworkOrder] = useState(false);
  const [showCollectionOrder, setShowCollectionOrder] = useState(false);

  // 购物车管理Hook
  const {
    carts,
    stats,
    loading: cartLoading,
    error: cartError,
    refreshData: refreshCartData,
  } = useCartAdmin();

  // 检查是否使用通用文件服务
  const [useUniversalService, setUseUniversalService] = useState<boolean>(false);
  const [storageModeDisplay, setStorageModeDisplay] = useState<string>('检查中...');

  // 加载文件服务配置
  useEffect(() => {
    const loadFileServiceConfig = async () => {
      try {
        const shouldUse = await shouldUseUniversalFileService();
        const displayName = await getStorageModeDisplayName();
        setUseUniversalService(shouldUse);
        setStorageModeDisplay(displayName);
      } catch (error) {
        console.error('加载文件服务配置失败:', error);
        setUseUniversalService(false);
        setStorageModeDisplay('配置加载失败');
      }
    };
    loadFileServiceConfig();
  }, []);

  // 配置表单状态
  const [configForm, setConfigForm] = useState<ConfigFormData>({
    siteName: config?.siteName || '',
    siteDescription: config?.siteDescription || '',
    heroTitle: config?.heroTitle || '',
    heroSubtitle: config?.heroSubtitle || '',
    maxCollectionsPerPage: config?.maxCollectionsPerPage || 9,
    enableSearch: config?.enableSearch || true,
    enableCategories: config?.enableCategories || true,
    defaultCategory: config?.defaultCategory || 'all',
    theme: config?.theme || 'light',
    language: config?.language || 'zh',
  });

  // 画集表单状态
  const [collectionForm, setCollectionForm] = useState<CollectionFormData>({
    title: '',
    artist: '',
    coverImage: '',
    coverImageFileId: undefined,
    description: '',
    category: CollectionCategory.COLLECTION,
    tags: [],
    isPublished: true,
    price: undefined,
  });

  // 作品表单状态
  const [artworkForm, setArtworkForm] = useState<ArtworkFormData>({
    title: '',
    artist: '',
    image: '',
    description: '',
    createdTime: '',
    theme: '',
  });

  // 更新配置表单
  React.useEffect(() => {
    if (config) {
      setConfigForm({
        siteName: config.siteName,
        siteDescription: config.siteDescription || '',
        heroTitle: config.heroTitle,
        heroSubtitle: config.heroSubtitle || '',
        maxCollectionsPerPage: config.maxCollectionsPerPage,
        enableSearch: config.enableSearch,
        enableCategories: config.enableCategories,
        defaultCategory: config.defaultCategory,
        theme: config.theme,
        language: config.language,
      });
    }
  }, [config]);

  // 作品管理tab自动选择画集逻辑
  React.useEffect(() => {
    if (activeTab === 'artworks' && collections.length > 0) {
      // 检查当前选择的画集是否还存在
      if (selectedCollection && !collections.find(c => c.id === selectedCollection)) {
        console.log('⚠️ [配置页面] 当前选择的画集已不存在，重置选择');
        setSelectedCollection(null);
        setShowArtworkOrder(false);
        setShowArtworkForm(false);
        setEditingArtwork(null);
      }
      // 如果用户未选择画集，自动选择第一个
      else if (!selectedCollection) {
        const firstCollection = collections[0];
        console.log('🎯 [配置页面] 作品管理tab首次进入，自动选择第一个画集:', {
          selectedCollection: firstCollection.id,
          title: firstCollection.title
        });
        setSelectedCollection(firstCollection.id);
      }
      // 如果用户已选择且画集存在，保留用户选择
      else {
        const currentCollection = collections.find(c => c.id === selectedCollection);
        console.log('✅ [配置页面] 保留用户选择的画集:', {
          selectedCollection: selectedCollection,
          title: currentCollection?.title
        });
      }
    }
  }, [activeTab, collections, selectedCollection]);

  // 当离开作品管理tab时，重置相关UI状态但保留用户选择的画集
  React.useEffect(() => {
    if (activeTab !== 'artworks') {
      // 只重置UI状态，保留selectedCollection让用户下次进入时还能看到之前选择的画集
      if (showArtworkOrder || showArtworkForm || editingArtwork) {
        console.log('🔄 [配置页面] 离开作品管理tab，重置UI状态但保留用户选择');
        setShowArtworkOrder(false);
        setShowArtworkForm(false);
        setEditingArtwork(null);
      }
    }
  }, [activeTab, showArtworkOrder, showArtworkForm, editingArtwork]);

  // 处理配置保存
  const handleSaveConfig = async () => {
    try {
      await updateConfig(configForm);
      alert('配置保存成功！');
    } catch (err) {
      alert('配置保存失败！');
    }
  };

  // 处理配置重置
  const handleResetConfig = async () => {
    if (confirm('确定要重置为默认配置吗？')) {
      try {
        await resetConfig();
        alert('配置重置成功！');
      } catch (err) {
        alert('配置重置失败！');
      }
    }
  };

  // 处理画集保存
  const handleSaveCollection = async () => {
    try {
      if (editingCollection) {
        await updateCollection(editingCollection, collectionForm);
        setEditingCollection(null);
      } else {
        await createCollection(collectionForm);
      }
      setShowCollectionForm(false);
      setCollectionForm({
        title: '',
        artist: '',
        coverImage: '',
        coverImageFileId: undefined,
        description: '',
        category: CollectionCategory.COLLECTION,
        tags: [],
        isPublished: true,
        price: undefined,
      });
      alert('画集保存成功！');
    } catch (err) {
      alert('画集保存失败！');
    }
  };

  // 处理作品保存
  const handleSaveArtwork = async () => {
    if (!selectedCollection) return;
    
    console.log('📝 [配置页面] 开始保存作品:', {
      isEditing: !!editingArtwork,
      selectedCollection,
      title: artworkForm.title,
      artist: artworkForm.artist,
      imagePresent: !!artworkForm.image,
      imageSize: artworkForm.image ? `${artworkForm.image.length} chars` : 'null'
    });
    
    try {
      if (editingArtwork) {
        console.log('✏️ [配置页面] 执行作品更新...', {
          collectionId: editingArtwork.collectionId,
          artworkId: editingArtwork.artworkId
        });
        await updateArtwork(editingArtwork.collectionId, editingArtwork.artworkId, artworkForm);
        setEditingArtwork(null);
        console.log('✅ [配置页面] 作品更新完成');
      } else {
        console.log('➕ [配置页面] 执行作品创建...', {
          collectionId: selectedCollection
        });
        await addArtworkToCollection(selectedCollection, artworkForm);
        console.log('✅ [配置页面] 作品创建完成');
      }
      
      console.log('🧹 [配置页面] 清理表单状态...');
      setShowArtworkForm(false);
      setArtworkForm({
        title: '',
        artist: '',
        image: '',
        fileId: undefined,
        description: '',
        createdTime: '',
        theme: '',
      });
      
      alert('作品保存成功！');
      console.log('🎉 [配置页面] 作品保存流程完成');
      
    } catch (err) {
      console.error('❌ [配置页面] 保存作品时发生错误:', err);
      console.error('错误上下文:', {
        isEditing: !!editingArtwork,
        selectedCollection,
        artworkTitle: artworkForm.title,
        errorMessage: err instanceof Error ? err.message : '未知错误',
        stack: err instanceof Error ? err.stack : undefined
      });
      
      const errorMessage = err instanceof Error ? err.message : '作品保存失败';
      alert(`作品保存失败：${errorMessage}`);
    }
  };

  // 编辑画集
  const handleEditCollection = (collection: any) => {
    setCollectionForm({
      title: collection.title,
      artist: collection.artist,
      coverImage: collection.coverImage,
      coverImageFileId: collection.coverImageFileId || undefined,
      description: collection.description,
      category: (collection.category as CollectionCategoryType) || CollectionCategory.COLLECTION,
      tags: collection.tags || [],
      isPublished: collection.isPublished ?? true,
      price: collection.price,
    });
    setEditingCollection(collection.id);
    setShowCollectionForm(true);
  };

  // 编辑作品
  const handleEditArtwork = (collectionId: number, artwork: any) => {
    setArtworkForm({
      title: artwork.title,
      artist: artwork.artist,
      image: artwork.image,
      fileId: artwork.fileId,
      description: artwork.description,
      createdTime: artwork.createdTime,
      theme: artwork.theme,
    });
    setEditingArtwork({ collectionId, artworkId: artwork.id });
    setShowArtworkForm(true);
  };

  // 切换作品排序显示
  const handleToggleArtworkOrder = async () => {
    if (!selectedCollection) {
      alert('请先选择一个画集');
      return;
    }
    setShowArtworkOrder(!showArtworkOrder);
  };

  // 切换画集排序显示
  const handleToggleCollectionOrder = async () => {
    setShowCollectionOrder(!showCollectionOrder);
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-4">
          <p className="text-red-600 text-lg">加载失败：{error}</p>
          <button
            onClick={refreshData}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* 顶部导航 */}
      <div className="bg-white shadow-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-8">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-slate-500 bg-transparent border-none cursor-pointer text-base transition-colors hover:text-slate-800"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 m-0">画集展览配置管理</h1>
              <p className="text-sm text-slate-500 m-0">管理展览的所有配置、画集和作品</p>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex gap-0">
          <button
            className={`flex items-center gap-2 px-6 py-4 bg-transparent border-none cursor-pointer border-b-2 transition-colors ${
              activeTab === 'general' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('general')}
          >
            <Settings size={18} />
            基础配置
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-4 bg-transparent border-none cursor-pointer border-b-2 transition-colors ${
              activeTab === 'collections' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('collections')}
          >
            <Database size={18} />
            画集管理
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-4 bg-transparent border-none cursor-pointer border-b-2 transition-colors ${
              activeTab === 'artworks' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('artworks')}
          >
            <Image size={18} />
            作品管理
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-4 bg-transparent border-none cursor-pointer border-b-2 transition-colors ${
              activeTab === 'carts' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('carts')}
          >
            <ShoppingCart size={18} />
            购物车管理
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto p-6">
        {/* 基础配置标签页 */}
        {activeTab === 'general' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">基础配置</h2>
                <p className="text-slate-600">配置网站的基本信息和显示选项</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleResetConfig} 
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  <RotateCcw size={16} />
                  重置默认
                </button>
                <button 
                  onClick={handleSaveConfig} 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} />
                  保存配置
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">网站名称</label>
                <input
                  type="text"
                  value={configForm.siteName}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, siteName: e.target.value }))}
                  placeholder="输入网站名称"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">网站描述</label>
                <textarea
                  value={configForm.siteDescription}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, siteDescription: e.target.value }))}
                  placeholder="输入网站描述"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">主标题</label>
                <input
                  type="text"
                  value={configForm.heroTitle}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, heroTitle: e.target.value }))}
                  placeholder="输入主标题"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">副标题</label>
                <textarea
                  value={configForm.heroSubtitle}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                  placeholder="输入副标题"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">每页显示画集数量</label>
                <input
                  type="number"
                  value={configForm.maxCollectionsPerPage}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, maxCollectionsPerPage: parseInt(e.target.value) }))}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">主题</label>
                <select
                  value={configForm.theme}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, theme: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                  <option value="auto">自动</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">语言</label>
                <select
                  value={configForm.language}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, language: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configForm.enableSearch}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, enableSearch: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">启用搜索功能</span>
                </label>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configForm.enableCategories}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, enableCategories: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">启用分类功能</span>
                </label>
              </div>
            </div>

            {/* 文件服务信息 */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">文件服务状态</h3>
              <p className="text-blue-700 mb-2">
                当前使用：<span className="font-medium">{storageModeDisplay}</span>
              </p>
              <p className="text-blue-600 text-sm">
                通用文件服务：{useUniversalService ? '已启用' : '未启用'}
              </p>
            </div>
          </div>
        )}

        {/* 画集管理标签页 */}
        {activeTab === 'collections' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">画集管理</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCollectionForm({
                      title: '',
                      artist: '',
                      coverImage: '',
                      description: '',
                      category: CollectionCategory.COLLECTION,
                      tags: [],
                      isPublished: true,
                      price: undefined,
                    });
                    setEditingCollection(null);
                    setShowCollectionForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  添加画集
                </button>
                <button
                  onClick={() => handleToggleCollectionOrder()}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  <ArrowUpDown size={16} />
                  {showCollectionOrder ? '关闭排序' : '画集排序'}
                </button>
              </div>
            </div>

            {showCollectionOrder && (
              <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">画集排序管理</h3>
                  <p className="text-slate-600">
                    拖拽或使用按钮调整画集在前台的显示顺序
                  </p>
                </div>
                <CollectionOrderManager
                  onOrderChanged={() => {
                    console.log('🔄 [配置页面] 画集顺序已更新（仅排序界面内更新）');
                  }}
                />
              </div>
            )}

            {!showCollectionOrder && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <div key={collection.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-slate-100 overflow-hidden">
                      <img 
                        src={collection.coverImage} 
                        alt={collection.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">{collection.title}</h3>
                      <p className="text-slate-600 text-sm mb-1">作者：{collection.artist}</p>
                      <p className="text-slate-600 text-sm mb-1">分类：{collection.category}</p>
                      <p className="text-slate-600 text-sm mb-1">价格：{collection.price ? `¥${collection.price}` : '免费'}</p>
                      <p className="text-slate-600 text-sm mb-1">作品数量：{collection.pages.length}</p>
                      <p className="text-slate-600 text-sm mb-3">状态：{collection.isPublished ? '已发布' : '草稿'}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCollection(collection)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded text-sm hover:bg-blue-200 transition-colors"
                        >
                          <Edit size={14} />
                          编辑
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('确定要删除这个画集吗？')) {
                              deleteCollection(collection.id);
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded text-sm hover:bg-red-200 transition-colors"
                        >
                          <Trash2 size={14} />
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 作品管理标签页 */}
        {activeTab === 'artworks' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">作品管理</h2>
              <div className="flex gap-3">
                <select
                  value={selectedCollection || ''}
                  onChange={(e) => setSelectedCollection(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">选择画集</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.title}
                    </option>
                  ))}
                </select>
                {selectedCollection && (
                  <>
                    <button
                      onClick={() => {
                        setArtworkForm({
                          title: '',
                          artist: '',
                          image: '',
                          description: '',
                          createdTime: '',
                          theme: '',
                        });
                        setEditingArtwork(null);
                        setShowArtworkForm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                      添加作品
                    </button>
                    <button
                      onClick={handleToggleArtworkOrder}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                      <ArrowUpDown size={16} />
                      {showArtworkOrder ? '关闭排序' : '作品排序'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {selectedCollection && showArtworkOrder && (
              <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">作品排序管理</h3>
                  <p className="text-slate-600">
                    拖拽或使用按钮调整作品在画集中的显示顺序
                  </p>
                </div>
                <ArtworkOrderManager
                  collectionId={selectedCollection}
                  onOrderChanged={() => {
                    console.log('🔄 [配置页面] 作品顺序已更新（仅排序界面内更新）');
                  }}
                />
              </div>
            )}

            {selectedCollection && !showArtworkOrder && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections
                  .find(c => c.id === selectedCollection)
                  ?.pages.map((artwork) => (
                    <div key={artwork.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-48 bg-slate-100 overflow-hidden">
                        {artwork.image && (
                          <img 
                            src={artwork.image} 
                            alt={artwork.title} 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="text-lg font-semibold text-slate-800 mb-2">{artwork.title}</h4>
                        <p className="text-slate-600 text-sm mb-1">作者：{artwork.artist}</p>
                        <p className="text-slate-600 text-sm mb-1">创作时间：{artwork.createdTime}</p>
                        <p className="text-slate-600 text-sm mb-1">主题：{artwork.theme}</p>
                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">{artwork.description}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditArtwork(selectedCollection, artwork)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded text-sm hover:bg-blue-200 transition-colors"
                          >
                            <Edit size={14} />
                            编辑
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('确定要删除这个作品吗？')) {
                                deleteArtwork(selectedCollection, artwork.id);
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded text-sm hover:bg-red-200 transition-colors"
                          >
                            <Trash2 size={14} />
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* 购物车管理标签页 */}
        {activeTab === 'carts' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">购物车管理</h2>
              <p className="text-slate-600">查看所有用户的购物车数据</p>
            </div>
            <CartAdminPanel 
              carts={carts}
              stats={stats}
              loading={cartLoading}
              error={cartError}
              onRefresh={refreshCartData}
            />
          </div>
        )}
      </div>

      {/* 画集表单弹窗 */}
      {showCollectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800">{editingCollection ? '编辑画集' : '添加画集'}</h3>
              <button
                onClick={() => setShowCollectionForm(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">标题</label>
                  <input
                    type="text"
                    value={collectionForm.title}
                    onChange={(e) => setCollectionForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="输入画集标题"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">作者</label>
                  <input
                    type="text"
                    value={collectionForm.artist}
                    onChange={(e) => setCollectionForm(prev => ({ ...prev, artist: e.target.value }))}
                    placeholder="输入作者名称"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <UniversalImageUpload
                    label="封面图片"
                    value={collectionForm.coverImage}
                    fileId={collectionForm.coverImageFileId}
                    onChange={(data: { image?: string; fileId?: string }) => setCollectionForm(prev => ({ 
                      ...prev, 
                      coverImage: data.image || '',
                      coverImageFileId: data.fileId
                    }))}
                    placeholder="上传封面图片"
                    businessType="cover"
                    showDebugInfo={true}
                    showTestButton={true}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">描述</label>
                  <textarea
                    value={collectionForm.description}
                    onChange={(e) => setCollectionForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入画集描述"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">分类</label>
                  <select
                    value={collectionForm.category}
                    onChange={(e) => setCollectionForm(prev => ({ ...prev, category: e.target.value as CollectionCategoryType }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {getAvailableCategories().map((category) => (
                      <option key={category} value={category}>
                        {getCategoryDisplayName(category)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">价格（元）</label>
                  <input
                    type="number"
                    value={collectionForm.price || ''}
                    onChange={(e) => setCollectionForm(prev => ({ 
                      ...prev, 
                      price: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="输入价格（留空表示免费）"
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={collectionForm.isPublished}
                      onChange={(e) => setCollectionForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">发布画集</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowCollectionForm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveCollection}
                className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 作品表单弹窗 */}
      {showArtworkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800">{editingArtwork ? '编辑作品' : '添加作品'}</h3>
              <button
                onClick={() => setShowArtworkForm(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">标题</label>
                  <input
                    type="text"
                    value={artworkForm.title}
                    onChange={(e) => setArtworkForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="输入作品标题"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">作者</label>
                  <input
                    type="text"
                    value={artworkForm.artist}
                    onChange={(e) => setArtworkForm(prev => ({ ...prev, artist: e.target.value }))}
                    placeholder="输入作者名称"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <UniversalImageUpload
                    label="作品图片"
                    value={artworkForm.image}
                    fileId={artworkForm.fileId}
                    onChange={(data: { image?: string; fileId?: string }) => setArtworkForm(prev => ({ 
                      ...prev, 
                      image: data.image,
                      fileId: data.fileId
                    }))}
                    placeholder="上传作品图片"
                    businessType="artwork"
                    showDebugInfo={true}
                    showTestButton={true}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">描述</label>
                  <textarea
                    value={artworkForm.description}
                    onChange={(e) => setArtworkForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入作品描述"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">创作时间</label>
                  <input
                    type="text"
                    value={artworkForm.createdTime}
                    onChange={(e) => setArtworkForm(prev => ({ ...prev, createdTime: e.target.value }))}
                    placeholder="输入创作时间"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">主题</label>
                  <input
                    type="text"
                    value={artworkForm.theme}
                    onChange={(e) => setArtworkForm(prev => ({ ...prev, theme: e.target.value }))}
                    placeholder="输入作品主题"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowArtworkForm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveArtwork}
                className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConfigPage() {
  return (
    <AuthProvider>
      <AuthGuard>
        <ConfigPageContent />
      </AuthGuard>
    </AuthProvider>
  );
} 