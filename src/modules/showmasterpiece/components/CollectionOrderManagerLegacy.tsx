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
import styles from './CollectionOrderManagerLegacy.module.css';

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
      
      console.log('📚 [画集排序] 开始加载画集数据...');
      const data = await getAllCollections();
      
      console.log('📚 [画集排序] 画集数据加载完成:', {
        collectionsCount: data.length,
        collections: data.map(c => ({
          id: c.id,
          title: c.title
        }))
      });
      
      setCollections(data);
      setOriginalOrder([...data]);
      setHasChanges(false);
    } catch (err) {
      console.error('❌ [画集排序] 加载画集数据错误:', err);
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
      
      console.log('⬆️ [画集排序] 上移操作详细状态:', {
        collectionId,
        currentIndex,
        totalCount: collections.length,
        collectionTitle: collections[currentIndex]?.title,
        // 显示当前排序状态
        currentSortOrder: collections.map((c, i) => ({ 
          uiIndex: i,
          id: c.id, 
          title: c.title,
          // 注意：前端索引0对应后端displayOrder最大值
          note: i === 0 ? '(UI最前/后端最大值)' : i === collections.length - 1 ? '(UI最后/后端最小值)' : ''
        }))
      });
      
      if (currentIndex === -1) {
        setError('画集不存在');
        console.error('❌ [画集排序] 画集不存在，ID:', collectionId);
        return;
      }
      if (currentIndex === 0) {
        setError('画集已经在最前面，无法上移');
        console.warn('⚠️ [画集排序] 画集已在最前面，无法上移 (UI索引0=后端displayOrder最大)');
        return;
      }
      
      // 先在本地状态中交换位置，避免闪烁
      const newCollections = [...collections];
      const targetIndex = currentIndex - 1;
      
      console.log('🔄 [画集排序] 准备交换位置:', {
        from: { 
          uiIndex: currentIndex, 
          id: newCollections[currentIndex].id, 
          title: newCollections[currentIndex].title,
          semantics: '向上移动(减小UI索引/增大displayOrder)'
        },
        to: { 
          uiIndex: targetIndex, 
          id: newCollections[targetIndex].id, 
          title: newCollections[targetIndex].title 
        }
      });
      
      [newCollections[currentIndex], newCollections[targetIndex]] = [newCollections[targetIndex], newCollections[currentIndex]];
      setCollections(newCollections);
      
      console.log('✅ [画集排序] 前端状态已更新，新顺序:', {
        newOrder: newCollections.map((c, i) => ({ 
          uiIndex: i, 
          id: c.id, 
          title: c.title 
        }))
      });
      
      // 后台异步保存到服务器
      console.log('📡 [画集排序] 开始后台保存操作...');
      await moveCollectionUp(collectionId);
      
      console.log('⬆️ [画集排序] 上移操作完成，重新加载数据确保同步...');
      
      // 重新加载数据确保前后端完全同步
      await loadCollections();
      
      onOrderChanged?.();
    } catch (err) {
      console.error('❌ [画集排序] 上移画集错误:', err);
      console.error('错误详情:', {
        message: err instanceof Error ? err.message : '未知错误',
        collectionId,
        currentState: collections.map(c => ({ id: c.id, title: c.title }))
      });
      setError(err instanceof Error ? err.message : '上移失败');
      // 如果保存失败，重新加载数据恢复状态
      console.log('🔄 [画集排序] 保存失败，重新加载数据恢复状态...');
      await loadCollections();
    }
  };

  // 下移画集
  const handleMoveDown = async (collectionId: number) => {
    try {
      setError(null);
      
      // 检查当前状态，确保操作有效
      const currentIndex = collections.findIndex(c => c.id === collectionId);
      
      console.log('⬇️ [画集排序] 下移操作详细状态:', {
        collectionId,
        currentIndex,
        totalCount: collections.length,
        collectionTitle: collections[currentIndex]?.title,
        // 显示当前排序状态
        currentSortOrder: collections.map((c, i) => ({ 
          uiIndex: i,
          id: c.id, 
          title: c.title,
          // 注意：前端索引0对应后端displayOrder最大值
          note: i === 0 ? '(UI最前/后端最大值)' : i === collections.length - 1 ? '(UI最后/后端最小值)' : ''
        }))
      });
      
      if (currentIndex === -1) {
        setError('画集不存在');
        console.error('❌ [画集排序] 画集不存在，ID:', collectionId);
        return;
      }
      if (currentIndex === collections.length - 1) {
        setError('画集已经在最后面，无法下移');
        console.warn('⚠️ [画集排序] 画集已在最后面，无法下移 (UI索引max=后端displayOrder最小)');
        return;
      }
      
      // 先在本地状态中交换位置，避免闪烁
      const newCollections = [...collections];
      const targetIndex = currentIndex + 1;
      
      console.log('🔄 [画集排序] 准备交换位置:', {
        from: { 
          uiIndex: currentIndex, 
          id: newCollections[currentIndex].id, 
          title: newCollections[currentIndex].title,
          semantics: '向下移动(增大UI索引/减小displayOrder)'
        },
        to: { 
          uiIndex: targetIndex, 
          id: newCollections[targetIndex].id, 
          title: newCollections[targetIndex].title 
        }
      });
      
      [newCollections[currentIndex], newCollections[targetIndex]] = [newCollections[targetIndex], newCollections[currentIndex]];
      setCollections(newCollections);
      
      console.log('✅ [画集排序] 前端状态已更新，新顺序:', {
        newOrder: newCollections.map((c, i) => ({ 
          uiIndex: i, 
          id: c.id, 
          title: c.title 
        }))
      });
      
      // 后台异步保存到服务器
      console.log('📡 [画集排序] 开始后台保存操作...');
      await moveCollectionDown(collectionId);
      
      console.log('⬇️ [画集排序] 下移操作完成，重新加载数据确保同步...');
      
      // 重新加载数据确保前后端完全同步
      await loadCollections();
      
      onOrderChanged?.();
    } catch (err) {
      console.error('❌ [画集排序] 下移画集错误:', err);
      console.error('错误详情:', {
        message: err instanceof Error ? err.message : '未知错误',
        collectionId,
        currentState: collections.map(c => ({ id: c.id, title: c.title }))
      });
      setError(err instanceof Error ? err.message : '下移失败');
      // 如果保存失败，重新加载数据恢复状态
      console.log('🔄 [画集排序] 保存失败，重新加载数据恢复状态...');
      await loadCollections();
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

      console.log('💾 [画集排序] 保存新顺序:', {
        collectionOrders: collectionOrders.map(co => ({ id: co.id, displayOrder: co.displayOrder }))
      });

      await updateCollectionOrder(collectionOrders);
      
      console.log('💾 [画集排序] 保存完成');
      
      // 更新原始顺序记录，标记为无变更
      setOriginalOrder([...collections]);
      setHasChanges(false);
      
      onOrderChanged?.();
    } catch (err) {
      console.error('❌ [画集排序] 保存顺序错误:', err);
      setError(err instanceof Error ? err.message : '保存失败');
      // 如果保存失败，重新加载数据恢复状态
      await loadCollections();
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