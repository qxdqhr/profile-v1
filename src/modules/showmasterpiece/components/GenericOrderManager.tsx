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
import styles from './GenericOrderManager.module.css';

interface OrderableItem {
  id: number;
  [key: string]: any;
}

interface OrderManagerOperations<T extends OrderableItem> {
  loadItems: () => Promise<T[]>;
  moveItemUp: (id: number) => Promise<void>; // 保留用于向后兼容，但在统一流程中不使用
  moveItemDown: (id: number) => Promise<void>; // 保留用于向后兼容，但在统一流程中不使用
  updateItemOrder: (orders: { id: number; order: number }[]) => Promise<void>; // 统一的批量更新接口
}

interface GenericOrderManagerProps<T extends OrderableItem> {
  operations: OrderManagerOperations<T>;
  renderItem: (item: T, index: number, isFirst: boolean, isLast: boolean) => React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  onOrderChanged?: () => void;
  emptyMessage?: string;
  loadingMessage?: string;
}

export function GenericOrderManager<T extends OrderableItem>({
  operations,
  renderItem,
  className = '',
  title = '顺序管理',
  description = '拖拽或使用按钮调整显示顺序',
  onOrderChanged,
  emptyMessage = '暂无数据',
  loadingMessage = '加载数据...'
}: GenericOrderManagerProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [originalOrder, setOriginalOrder] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // 加载数据
  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await operations.loadItems();
      
      setItems(data);
      setOriginalOrder([...data]);
      setHasChanges(false);
    } catch (err) {
      console.error('❌ [通用排序] 加载数据错误:', err);
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // 检查是否有变更
  useEffect(() => {
    const hasOrderChanged = items.some((item, index) => 
      originalOrder[index]?.id !== item.id
    );
    setHasChanges(hasOrderChanged);
  }, [items, originalOrder]);

  // 上移项目
  const handleMoveUp = async (itemId: number) => {
    try {
      setError(null);
      
      const currentIndex = items.findIndex(item => item.id === itemId);
      if (currentIndex === -1) {
        setError('项目不存在');
        return;
      }
      if (currentIndex === 0) {
        setError('项目已经在最前面，无法上移');
        return;
      }
      
      // 只在本地状态中交换位置，与拖拽操作保持一致
      const newItems = [...items];
      const targetIndex = currentIndex - 1;
      [newItems[currentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[currentIndex]];
      setItems(newItems);
      
    } catch (err) {
      console.error('❌ [通用排序] 上移项目错误:', err);
      setError(err instanceof Error ? err.message : '上移失败');
    }
  };

  // 下移项目
  const handleMoveDown = async (itemId: number) => {
    try {
      setError(null);
      
      const currentIndex = items.findIndex(item => item.id === itemId);
      if (currentIndex === -1) {
        setError('项目不存在');
        return;
      }
      if (currentIndex === items.length - 1) {
        setError('项目已经在最后面，无法下移');
        return;
      }
      
      // 只在本地状态中交换位置，与拖拽操作保持一致
      const newItems = [...items];
      const targetIndex = currentIndex + 1;
      [newItems[currentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[currentIndex]];
      setItems(newItems);
      
    } catch (err) {
      console.error('❌ [通用排序] 下移项目错误:', err);
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

    const newItems = [...items];
    const draggedItemData = newItems[draggedItem];
    
    // 移除拖拽的项目
    newItems.splice(draggedItem, 1);
    // 在新位置插入
    newItems.splice(dropIndex, 0, draggedItemData);
    
    setItems(newItems);
    setDraggedItem(null);
  };

  // 保存新顺序
  const handleSaveOrder = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // 生成新的显示顺序
      const itemOrders = items.map((item, index) => ({
        id: item.id,
        order: items.length - index, // 从高到低排序
      }));

      await operations.updateItemOrder(itemOrders);
      
      // 更新原始顺序记录，标记为无变更
      setOriginalOrder([...items]);
      setHasChanges(false);
      
      onOrderChanged?.();
    } catch (err) {
      console.error('❌ [通用排序] 保存顺序错误:', err);
      setError(err instanceof Error ? err.message : '保存失败');
      // 如果保存失败，重新加载数据恢复状态
      await loadItems();
    } finally {
      setSaving(false);
    }
  };

  // 重置顺序
  const handleResetOrder = () => {
    setItems([...originalOrder]);
  };

  if (loading) {
    return (
      <div className={`${styles.loading} ${className}`}>
        <div className={styles.spinner} />
        <span>{loadingMessage}</span>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h3>{title}</h3>
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
        <p>{description}</p>
        <ul>
          <li>使用拖拽：点击并拖动 <GripVertical size={14} className={styles.inlineIcon} /> 图标</li>
          <li>使用按钮：点击 <ChevronUp size={14} className={styles.inlineIcon} /> 或 <ChevronDown size={14} className={styles.inlineIcon} /> 按钮</li>
          <li>完成调整后，点击"保存顺序"按钮保存更改</li>
        </ul>
      </div>

      <div className={styles.itemList}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`${styles.itemWrapper} ${draggedItem === index ? styles.dragging : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className={styles.dragHandle}>
              <GripVertical size={20} />
            </div>
            
            <div className={styles.itemContent}>
              {renderItem(item, index, index === 0, index === items.length - 1)}
            </div>

            <div className={styles.orderInfo}>
              <span className={styles.orderNumber}>#{index + 1}</span>
            </div>

            <div className={styles.moveButtons}>
              <button
                onClick={() => handleMoveUp(item.id)}
                disabled={index === 0}
                className={styles.moveButton}
                title="上移"
              >
                <ChevronUp size={18} />
              </button>
              <button
                onClick={() => handleMoveDown(item.id)}
                disabled={index === items.length - 1}
                className={styles.moveButton}
                title="下移"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className={styles.empty}>
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
} 