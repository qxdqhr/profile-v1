'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  GripVertical, 
  Save,
  RotateCcw,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { 
  getArtworksByCollection,
  updateArtworkOrder,
  moveArtworkUp,
  moveArtworkDown
} from '../services/masterpiecesConfigService';
import type { ArtworkPage } from '../types';
import styles from './ArtworkOrderManagerLegacy.module.css';

interface ArtworkOrderManagerProps {
  collectionId: number;
  onOrderChanged?: () => void;
}

type ArtworkWithOrder = ArtworkPage & { pageOrder: number };

export function ArtworkOrderManager({ collectionId, onOrderChanged }: ArtworkOrderManagerProps) {
  const [artworks, setArtworks] = useState<ArtworkWithOrder[]>([]);
  const [originalOrder, setOriginalOrder] = useState<ArtworkWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // 加载作品数据
  const loadArtworks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 [作品排序] 开始加载作品数据...', { collectionId });
      const data = await getArtworksByCollection(collectionId);
      
      // 添加调试信息
      console.log('📋 [作品排序] 加载作品数据完成:', {
        collectionId,
        artworksCount: data.length,
        artworks: data.map(a => ({
          id: a.id,
          title: a.title,
          pageOrder: a.pageOrder
        }))
      });
      
      setArtworks(data);
      setOriginalOrder([...data]);
      setHasChanges(false);
    } catch (err) {
      console.error('❌ [作品排序] 加载作品数据错误:', err);
      setError(err instanceof Error ? err.message : '加载作品失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collectionId) {
      loadArtworks();
    }
  }, [collectionId]);

  // 检查是否有变更
  useEffect(() => {
    const hasOrderChanged = artworks.some((artwork, index) => 
      originalOrder[index]?.id !== artwork.id
    );
    setHasChanges(hasOrderChanged);
  }, [artworks, originalOrder]);

  // 上移作品
  const handleMoveUp = async (artworkId: number) => {
    try {
      setError(null);
      
      // 检查当前状态，确保操作有效
      const currentIndex = artworks.findIndex(a => a.id === artworkId);
      if (currentIndex === -1) {
        setError('作品不存在');
        return;
      }
      if (currentIndex === 0) {
        setError('作品已经在最前面，无法上移');
        return;
      }
      
      // 添加调试信息
      console.log('⬆️ [作品排序] 上移作品调试信息:', {
        artworkId,
        currentIndex,
        totalCount: artworks.length,
        artworkTitle: artworks[currentIndex]?.title
      });
      
      // 先在本地状态中交换位置，避免闪烁
      const newArtworks = [...artworks];
      const targetIndex = currentIndex - 1;
      [newArtworks[currentIndex], newArtworks[targetIndex]] = [newArtworks[targetIndex], newArtworks[currentIndex]];
      setArtworks(newArtworks);
      
      // 后台异步保存到服务器
      await moveArtworkUp(collectionId, artworkId);
      
      console.log('⬆️ [作品排序] 上移操作完成');
      onOrderChanged?.();
    } catch (err) {
      console.error('❌ [作品排序] 上移作品错误:', err);
      setError(err instanceof Error ? err.message : '上移失败');
      // 如果保存失败，重新加载数据恢复状态
      await loadArtworks();
    }
  };

  // 下移作品
  const handleMoveDown = async (artworkId: number) => {
    try {
      setError(null);
      
      // 检查当前状态，确保操作有效
      const currentIndex = artworks.findIndex(a => a.id === artworkId);
      if (currentIndex === -1) {
        setError('作品不存在');
        return;
      }
      if (currentIndex === artworks.length - 1) {
        setError('作品已经在最后面，无法下移');
        return;
      }
      
      // 添加调试信息
      console.log('⬇️ [作品排序] 下移作品调试信息:', {
        artworkId,
        currentIndex,
        totalCount: artworks.length,
        artworkTitle: artworks[currentIndex]?.title
      });
      
      // 先在本地状态中交换位置，避免闪烁
      const newArtworks = [...artworks];
      const targetIndex = currentIndex + 1;
      [newArtworks[currentIndex], newArtworks[targetIndex]] = [newArtworks[targetIndex], newArtworks[currentIndex]];
      setArtworks(newArtworks);
      
      // 后台异步保存到服务器
      await moveArtworkDown(collectionId, artworkId);
      
      console.log('⬇️ [作品排序] 下移操作完成');
      onOrderChanged?.();
    } catch (err) {
      console.error('❌ [作品排序] 下移作品错误:', err);
      setError(err instanceof Error ? err.message : '下移失败');
      // 如果保存失败，重新加载数据恢复状态
      await loadArtworks();
    }
  };

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 拖拽悬停
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 拖拽放置
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const newArtworks = [...artworks];
    const draggedArtwork = newArtworks[draggedItem];
    
    // 移除拖拽的项目
    newArtworks.splice(draggedItem, 1);
    // 在新位置插入
    newArtworks.splice(dropIndex, 0, draggedArtwork);
    
    setArtworks(newArtworks);
    setDraggedItem(null);
  };

  // 保存新顺序
  const handleSaveOrder = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // 生成新的页面顺序
      const artworkOrders = artworks.map((artwork, index) => ({
        id: artwork.id,
        pageOrder: index, // 从0开始的顺序
      }));

      console.log('💾 [作品排序] 保存新顺序:', {
        collectionId,
        artworkOrders: artworkOrders.map(ao => ({ id: ao.id, pageOrder: ao.pageOrder }))
      });

      await updateArtworkOrder(collectionId, artworkOrders);
      
      console.log('💾 [作品排序] 保存完成');
      
      // 更新原始顺序记录，标记为无变更
      setOriginalOrder([...artworks]);
      setHasChanges(false);
      
      onOrderChanged?.();
    } catch (err) {
      console.error('❌ [作品排序] 保存顺序错误:', err);
      setError(err instanceof Error ? err.message : '保存失败');
      // 如果保存失败，重新加载数据恢复状态
      await loadArtworks();
    } finally {
      setSaving(false);
    }
  };

  // 重置顺序
  const handleResetOrder = () => {
    setArtworks([...originalOrder]);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>加载作品数据...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>作品顺序管理</h3>
        <div className={styles.actions}>
          {hasChanges && (
            <>
              <button
                onClick={handleResetOrder}
                className={styles.resetButton}
                title="重置为原始顺序"
              >
                <RotateCcw size={16} />
                重置
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={saving}
                className={styles.saveButton}
                title="保存新顺序"
              >
                <Save size={16} />
                {saving ? '保存中...' : '保存顺序'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.hint}>
        <p>您可以通过以下方式调整作品顺序：</p>
        <ul>
          <li>使用拖拽：点击并拖动 <GripVertical size={14} className={styles.inlineIcon} /> 图标</li>
          <li>使用按钮：点击 <ChevronUp size={14} className={styles.inlineIcon} /> 或 <ChevronDown size={14} className={styles.inlineIcon} /> 按钮</li>
        </ul>
      </div>

      <div className={styles.artworkList}>
        {artworks.map((artwork, index) => (
          <div
            key={artwork.id}
            className={`${styles.artworkItem} ${draggedItem === index ? styles.dragging : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className={styles.dragHandle}>
              <GripVertical size={20} />
            </div>
            
            <div className={styles.artworkInfo}>
              <div className={styles.imageWrapper}>
                {artwork.image || artwork.imageUrl ? (
                  <img
                    src={artwork.image || artwork.imageUrl}
                    alt={artwork.title}
                    className={styles.artworkImage}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // 如果图片加载失败，显示占位符
                      target.style.display = 'none';
                      const placeholder = target.parentElement?.querySelector('.placeholder') as HTMLElement;
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <ImageIcon size={24} />
                  </div>
                )}
                <div className={`${styles.imagePlaceholder} placeholder`} style={{ display: 'none' }}>
                  <ImageIcon size={24} />
                </div>
              </div>
              <div className={styles.details}>
                <h4>{artwork.title}</h4>
                <p>{artwork.artist}</p>
                {artwork.theme && (
                  <span className={styles.theme}>{artwork.theme}</span>
                )}
                {artwork.createdTime && (
                  <span className={styles.createdTime}>{artwork.createdTime}</span>
                )}
              </div>
            </div>

            <div className={styles.orderInfo}>
              <span className={styles.orderNumber}>#{index + 1}</span>
            </div>

            <div className={styles.moveButtons}>
              <button
                onClick={() => handleMoveUp(artwork.id)}
                disabled={index === 0}
                className={styles.moveButton}
                title="上移"
              >
                <ChevronUp size={18} />
              </button>
              <button
                onClick={() => handleMoveDown(artwork.id)}
                disabled={index === artworks.length - 1}
                className={styles.moveButton}
                title="下移"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {artworks.length === 0 && (
        <div className={styles.empty}>
          <p>暂无作品数据</p>
        </div>
      )}
    </div>
  );
} 