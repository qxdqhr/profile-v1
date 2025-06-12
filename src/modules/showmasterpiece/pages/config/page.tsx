'use client';

import React, { useState } from 'react';
import { ArrowLeft, Settings, Database, Image, Tag, Save, RotateCcw, Plus, Edit, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { useMasterpiecesConfig } from '../../hooks/useMasterpiecesConfig';
import { ConfigFormData, CollectionFormData, ArtworkFormData } from '../../types';
import { ImageUpload } from '@/components/common';
import { AuthGuard, AuthProvider } from '@/modules/auth';
import { CollectionOrderManager } from '../../components/CollectionOrderManager';
import { ArtworkOrderManager } from '../../components/ArtworkOrderManager';
import styles from './ConfigPage.module.css';

type TabType = 'general' | 'collections' | 'artworks';

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
    moveArtworkUp,
    moveArtworkDown,
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
    description: '',
    category: '',
    tags: [],
    isPublished: true,
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
        siteDescription: config.siteDescription,
        heroTitle: config.heroTitle,
        heroSubtitle: config.heroSubtitle,
        maxCollectionsPerPage: config.maxCollectionsPerPage,
        enableSearch: config.enableSearch,
        enableCategories: config.enableCategories,
        defaultCategory: config.defaultCategory,
        theme: config.theme,
        language: config.language,
      });
    }
  }, [config]);

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
        description: '',
        category: '',
        tags: [],
        isPublished: true,
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
      description: collection.description,
      category: collection.category || '',
      tags: collection.tags || [],
      isPublished: collection.isPublished ?? true,
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
      description: artwork.description || '',
      createdTime: artwork.createdTime || '',
      theme: artwork.theme || '',
    });
    setEditingArtwork({ collectionId, artworkId: artwork.id });
    setShowArtworkForm(true);
  };

  // 处理作品移动
  const handleMoveArtworkUp = async (collectionId: number, artworkId: number) => {
    try {
      await moveArtworkUp(collectionId, artworkId);
    } catch (err) {
      alert(err instanceof Error ? err.message : '上移作品失败');
    }
  };

  const handleMoveArtworkDown = async (collectionId: number, artworkId: number) => {
    try {
      await moveArtworkDown(collectionId, artworkId);
    } catch (err) {
      alert(err instanceof Error ? err.message : '下移作品失败');
    }
  };

  // 处理作品排序切换
  const handleToggleArtworkOrder = async () => {
    if (showArtworkOrder) {
      // 关闭排序时刷新数据确保显示最新顺序
      console.log('🔄 [配置页面] 关闭排序，刷新作品数据...');
      try {
        await refreshData();
        console.log('✅ [配置页面] 作品数据刷新完成');
      } catch (err) {
        console.error('❌ [配置页面] 刷新数据失败:', err);
      }
    }
    setShowArtworkOrder(!showArtworkOrder);
  };

  // 处理画集排序切换
  const handleToggleCollectionOrder = async () => {
    if (showCollectionOrder) {
      // 关闭排序时刷新数据确保显示最新顺序
      console.log('🔄 [配置页面] 关闭画集排序，刷新画集数据...');
      try {
        await refreshData();
        console.log('✅ [配置页面] 画集数据刷新完成');
      } catch (err) {
        console.error('❌ [配置页面] 刷新画集数据失败:', err);
      }
    }
    setShowCollectionOrder(!showCollectionOrder);
  };

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

  return (
    <div className={styles.container}>
      {/* 顶部导航 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerNav}>
            <button
              onClick={() => window.history.back()}
              className={styles.backButton}
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>
            <div className={styles.headerTitle}>
              <h1>画集展览配置管理</h1>
              <p>管理展览的所有配置、画集和作品</p>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'general' ? styles.active : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Settings size={18} />
            基础配置
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'collections' ? styles.active : ''}`}
            onClick={() => setActiveTab('collections')}
          >
            <Database size={18} />
            画集管理
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'artworks' ? styles.active : ''}`}
            onClick={() => setActiveTab('artworks')}
          >
            <Image size={18} />
            作品管理
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className={styles.mainContent}>
        {/* 基础配置标签页 */}
        {activeTab === 'general' && (
          <div className={styles.configSection}>
            <div className={styles.sectionHeader}>
              <h2>基础配置</h2>
              <div className={styles.sectionActions}>
                <button onClick={handleResetConfig} className={styles.resetButton}>
                  <RotateCcw size={16} />
                  重置默认
                </button>
                <button onClick={handleSaveConfig} className={styles.saveButton}>
                  <Save size={16} />
                  保存配置
                </button>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>网站名称</label>
                <input
                  type="text"
                  value={configForm.siteName}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, siteName: e.target.value }))}
                  placeholder="输入网站名称"
                />
              </div>

              <div className={styles.formGroup}>
                <label>网站描述</label>
                <textarea
                  value={configForm.siteDescription}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, siteDescription: e.target.value }))}
                  placeholder="输入网站描述"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>主标题</label>
                <input
                  type="text"
                  value={configForm.heroTitle}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, heroTitle: e.target.value }))}
                  placeholder="输入主标题"
                />
              </div>

              <div className={styles.formGroup}>
                <label>副标题</label>
                <textarea
                  value={configForm.heroSubtitle}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                  placeholder="输入副标题"
                  rows={2}
                />
              </div>

              <div className={styles.formGroup}>
                <label>每页显示画集数量</label>
                <input
                  type="number"
                  value={configForm.maxCollectionsPerPage}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, maxCollectionsPerPage: parseInt(e.target.value) }))}
                  min="1"
                  max="50"
                />
              </div>

              <div className={styles.formGroup}>
                <label>主题</label>
                <select
                  value={configForm.theme}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, theme: e.target.value as any }))}
                >
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                  <option value="auto">自动</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>语言</label>
                <select
                  value={configForm.language}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, language: e.target.value as any }))}
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={configForm.enableSearch}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, enableSearch: e.target.checked }))}
                  />
                  启用搜索功能
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={configForm.enableCategories}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, enableCategories: e.target.checked }))}
                  />
                  启用分类功能
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 画集管理标签页 */}
        {activeTab === 'collections' && (
          <div className={styles.collectionsSection}>
            <div className={styles.sectionHeader}>
              <h2>画集管理</h2>
              <div className={styles.sectionActions}>
                <button
                  onClick={() => {
                    setCollectionForm({
                      title: '',
                      artist: '',
                      coverImage: '',
                      description: '',
                      category: '',
                      tags: [],
                      isPublished: true,
                    });
                    setEditingCollection(null);
                    setShowCollectionForm(true);
                  }}
                  className={styles.addButton}
                >
                  <Plus size={16} />
                  添加画集
                </button>
                <button
                  onClick={() => handleToggleCollectionOrder()}
                  className={styles.orderButton}
                >
                  <ArrowUpDown size={16} />
                  {showCollectionOrder ? '关闭排序' : '画集排序'}
                </button>
              </div>
            </div>

            {showCollectionOrder && (
              <div className={styles.collectionOrderSection}>
                <div className={styles.orderSectionHeader}>
                  <h3>画集排序管理</h3>
                  <p className={styles.orderDescription}>
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
              <div className={styles.collectionsList}>
                {collections.map((collection) => (
                  <div key={collection.id} className={styles.collectionItem}>
                    <div className={styles.collectionImage}>
                      <img src={collection.coverImage} alt={collection.title} />
                    </div>
                    <div className={styles.collectionInfo}>
                      <h3>{collection.title}</h3>
                      <p>作者：{collection.artist}</p>
                      <p>分类：{collection.category}</p>
                      <p>作品数量：{collection.pages.length}</p>
                      <p>状态：{collection.isPublished ? '已发布' : '草稿'}</p>
                    </div>
                    <div className={styles.collectionActions}>
                      <button
                        onClick={() => handleEditCollection(collection)}
                        className={styles.editButton}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('确定要删除这个画集吗？')) {
                            deleteCollection(collection.id);
                          }
                        }}
                        className={styles.deleteButton}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 作品管理标签页 */}
        {activeTab === 'artworks' && (
          <div className={styles.artworksSection}>
            <div className={styles.sectionHeader}>
              <h2>作品管理</h2>
              <div className={styles.sectionActions}>
                <select
                  value={selectedCollection || ''}
                  onChange={(e) => setSelectedCollection(e.target.value ? parseInt(e.target.value) : null)}
                  className={styles.collectionSelect}
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
                      className={styles.addButton}
                    >
                      <Plus size={16} />
                      添加作品
                    </button>
                    <button
                      onClick={handleToggleArtworkOrder}
                      className={styles.orderButton}
                    >
                      <ArrowUpDown size={16} />
                      {showArtworkOrder ? '关闭排序' : '作品排序'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {selectedCollection && showArtworkOrder && (
              <div className={styles.artworkOrderSection}>
                <ArtworkOrderManager 
                  collectionId={selectedCollection}
                  onOrderChanged={() => {
                    console.log('🔄 [配置页面] 作品顺序已更新（仅排序界面内更新）');
                  }}
                />
              </div>
            )}

            {selectedCollection && !showArtworkOrder && (
              <div className={styles.artworksList}>
                {collections
                  .find(c => c.id === selectedCollection)
                  ?.pages.map((artwork, index, artworks) => (
                    <div key={artwork.id} className={styles.artworkItem}>
                      <div className={styles.artworkImage}>
                        <img 
                          src={artwork.image || artwork.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuacn+WbvueJhzwvdGV4dD48L3N2Zz4='} 
                          alt={artwork.title}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuacn+WbvueJhzwvdGV4dD48L3N2Zz4=';
                            if (target.src !== placeholder) {
                              target.src = placeholder;
                            }
                          }}
                          style={{ maxWidth: '100%', height: 'auto', backgroundColor: '#f5f5f5' }}
                        />
                      </div>
                      <div className={styles.artworkInfo}>
                        <h4>{artwork.title}</h4>
                        <p>作者：{artwork.artist}</p>
                        <p>创作时间：{artwork.createdTime}</p>
                        <p>主题：{artwork.theme}</p>
                      </div>
                      <div className={styles.artworkActions}>
                        {/* 排序按钮 */}
                        <div className={styles.sortButtons}>
                          <button
                            onClick={() => handleMoveArtworkUp(selectedCollection!, artwork.id)}
                            className={`${styles.sortButton} ${index === 0 ? styles.disabled : ''}`}
                            disabled={index === 0}
                            title="上移"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMoveArtworkDown(selectedCollection!, artwork.id)}
                            className={`${styles.sortButton} ${index === artworks.length - 1 ? styles.disabled : ''}`}
                            disabled={index === artworks.length - 1}
                            title="下移"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        
                        {/* 编辑和删除按钮 */}
                        <button
                          onClick={() => handleEditArtwork(selectedCollection!, artwork)}
                          className={styles.editButton}
                          title="编辑"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('确定要删除这个作品吗？')) {
                              deleteArtwork(selectedCollection!, artwork.id);
                            }
                          }}
                          className={styles.deleteButton}
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 画集表单弹窗 */}
      {showCollectionForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingCollection ? '编辑画集' : '添加画集'}</h3>
              <button
                onClick={() => setShowCollectionForm(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>标题</label>
                <input
                  type="text"
                  value={collectionForm.title}
                  onChange={(e) => setCollectionForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入画集标题"
                />
              </div>
              <div className={styles.formGroup}>
                <label>作者</label>
                <input
                  type="text"
                  value={collectionForm.artist}
                  onChange={(e) => setCollectionForm(prev => ({ ...prev, artist: e.target.value }))}
                  placeholder="输入作者名称"
                />
              </div>
              <div className={styles.formGroup}>
                <ImageUpload
                  label="封面图片"
                  value={collectionForm.coverImage}
                  onChange={(value) => setCollectionForm(prev => ({ ...prev, coverImage: value }))}
                  placeholder="输入封面图片URL或上传本地图片"
                />
              </div>
              <div className={styles.formGroup}>
                <label>描述</label>
                <textarea
                  value={collectionForm.description}
                  onChange={(e) => setCollectionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="输入画集描述"
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>分类</label>
                <input
                  type="text"
                  value={collectionForm.category}
                  onChange={(e) => setCollectionForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="输入分类"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={collectionForm.isPublished}
                    onChange={(e) => setCollectionForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                  />
                  发布画集
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowCollectionForm(false)}
                className={styles.cancelButton}
              >
                取消
              </button>
              <button
                onClick={handleSaveCollection}
                className={styles.saveButton}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 作品表单弹窗 */}
      {showArtworkForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingArtwork ? '编辑作品' : '添加作品'}</h3>
              <button
                onClick={() => setShowArtworkForm(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>标题</label>
                <input
                  type="text"
                  value={artworkForm.title}
                  onChange={(e) => setArtworkForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入作品标题"
                />
              </div>
              <div className={styles.formGroup}>
                <label>作者</label>
                <input
                  type="text"
                  value={artworkForm.artist}
                  onChange={(e) => setArtworkForm(prev => ({ ...prev, artist: e.target.value }))}
                  placeholder="输入作者名称"
                />
              </div>
              <div className={styles.formGroup}>
                <ImageUpload
                  label="作品图片"
                  value={artworkForm.image}
                  onChange={(value) => setArtworkForm(prev => ({ ...prev, image: value }))}
                  placeholder="输入作品图片URL或上传本地图片"
                />
              </div>
              <div className={styles.formGroup}>
                <label>描述</label>
                <textarea
                  value={artworkForm.description}
                  onChange={(e) => setArtworkForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="输入作品描述"
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>创作时间</label>
                <input
                  type="text"
                  value={artworkForm.createdTime}
                  onChange={(e) => setArtworkForm(prev => ({ ...prev, createdTime: e.target.value }))}
                  placeholder="输入创作时间"
                />
              </div>
              <div className={styles.formGroup}>
                <label>主题</label>
                <input
                  type="text"
                  value={artworkForm.theme}
                  onChange={(e) => setArtworkForm(prev => ({ ...prev, theme: e.target.value }))}
                  placeholder="输入主题"
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowArtworkForm(false)}
                className={styles.cancelButton}
              >
                取消
              </button>
              <button
                onClick={handleSaveArtwork}
                className={styles.saveButton}
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