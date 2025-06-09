'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  GripVertical, 
  Save,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { 
  getAllCollections,
  updateCollectionOrder,
  moveCollectionUp,
  moveCollectionDown
} from '../services/masterpiecesConfigService';
import type { ArtCollection } from '../types';
import styles from './CollectionOrderManager.module.css';

interface CollectionOrderManagerProps {
  onOrderChanged?: () => void;
}

export function CollectionOrderManager({ onOrderChanged }: CollectionOrderManagerProps) {
  const [collections, setCollections] = useState<ArtCollection[]>([]);
  const [originalOrder, setOriginalOrder] = useState<ArtCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // 加载画集数据
  const loadCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCollections();
      setCollections(data);
      setOriginalOrder([...data]);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载画集失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  // 检查是否有变更
  useEffect(() => {
    const hasOrderChanged = collections.some((collection, index) => 
      originalOrder[index]?.id !== collection.id
    );
    setHasChanges(hasOrderChanged);
  }, [collections, originalOrder]);

  // 上移画集
  const handleMoveUp = async (collectionId: number) => {
    try {
      setError(null);
      
      // 检查当前状态，确保操作有效
      const currentIndex = collections.findIndex(c => c.id === collectionId);
      if (currentIndex === -1) {
        setError('画集不存在');
        return;
      }
      if (currentIndex === 0) {
        setError('画集已经在最前面，无法上移');
        return;
      }
      
      await moveCollectionUp(collectionId);
      await loadCollections();
      onOrderChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '上移失败');
    }
  };

  // 下移画集
  const handleMoveDown = async (collectionId: number) => {
    try {
      setError(null);
      
      // 检查当前状态，确保操作有效
      const currentIndex = collections.findIndex(c => c.id === collectionId);
      if (currentIndex === -1) {
        setError('画集不存在');
        return;
      }
      if (currentIndex === collections.length - 1) {
        setError('画集已经在最后面，无法下移');
        return;
      }
      
      await moveCollectionDown(collectionId);
      await loadCollections();
      onOrderChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '下移失败');
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

    const newCollections = [...collections];
    const draggedCollection = newCollections[draggedItem];
    
    // 移除拖拽的项目
    newCollections.splice(draggedItem, 1);
    // 在新位置插入
    newCollections.splice(dropIndex, 0, draggedCollection);
    
    setCollections(newCollections);
    setDraggedItem(null);
  };

  // 保存新顺序
  const handleSaveOrder = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // 生成新的显示顺序
      const collectionOrders = collections.map((collection, index) => ({
        id: collection.id,
        displayOrder: collections.length - index, // 从高到低排序
      }));

      await updateCollectionOrder(collectionOrders);
      await loadCollections();
      onOrderChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 重置顺序
  const handleResetOrder = () => {
    setCollections([...originalOrder]);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>加载画集数据...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>画集顺序管理</h3>
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
        <p>您可以通过以下方式调整画集顺序：</p>
        <ul>
          <li>使用拖拽：点击并拖动 <GripVertical size={14} className={styles.inlineIcon} /> 图标</li>
          <li>使用按钮：点击 <ChevronUp size={14} className={styles.inlineIcon} /> 或 <ChevronDown size={14} className={styles.inlineIcon} /> 按钮</li>
        </ul>
      </div>

      <div className={styles.collectionList}>
        {collections.map((collection, index) => (
          <div
            key={collection.id}
            className={`${styles.collectionItem} ${draggedItem === index ? styles.dragging : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className={styles.dragHandle}>
              <GripVertical size={20} />
            </div>
            
            <div className={styles.collectionInfo}>
              <img
                src={collection.coverImage || '/placeholder-image.png'}
                alt={collection.title}
                className={styles.coverImage}
              />
              <div className={styles.details}>
                <h4>{collection.title}</h4>
                <p>{collection.artist}</p>
                {collection.category && (
                  <span className={styles.category}>{collection.category}</span>
                )}
              </div>
            </div>

            <div className={styles.orderInfo}>
              <span className={styles.orderNumber}>#{index + 1}</span>
            </div>

            <div className={styles.moveButtons}>
              <button
                onClick={() => handleMoveUp(collection.id)}
                disabled={index === 0}
                className={styles.moveButton}
                title="上移"
              >
                <ChevronUp size={18} />
              </button>
              <button
                onClick={() => handleMoveDown(collection.id)}
                disabled={index === collections.length - 1}
                className={styles.moveButton}
                title="下移"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {collections.length === 0 && (
        <div className={styles.empty}>
          <p>暂无画集数据</p>
        </div>
      )}
    </div>
  );
} 