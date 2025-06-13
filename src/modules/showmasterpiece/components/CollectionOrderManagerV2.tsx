'use client';

import React from 'react';
import { GenericOrderManager } from '@/components/GenericOrderManager';
import { 
  getAllCollections,
  updateCollectionOrder,
  moveCollectionUp,
  moveCollectionDown
} from '../services/masterpiecesConfigService';
import type { ArtCollection } from '../types';

interface CollectionOrderManagerV2Props {
  onOrderChanged?: () => void;
}

export function CollectionOrderManagerV2({ onOrderChanged }: CollectionOrderManagerV2Props) {
  // 定义操作函数
  const operations = {
    loadItems: async (): Promise<ArtCollection[]> => {
      console.log('📚 [画集排序V2] 开始加载画集数据...');
      const data = await getAllCollections();
      console.log('📚 [画集排序V2] 画集数据加载完成:', {
        collectionsCount: data.length,
        collections: data.map(c => ({ id: c.id, title: c.title }))
      });
      return data;
    },

    moveItemUp: async (id: number): Promise<void> => {
      console.log('⬆️ [画集排序V2] 执行上移操作:', id);
      await moveCollectionUp(id);
    },

    moveItemDown: async (id: number): Promise<void> => {
      console.log('⬇️ [画集排序V2] 执行下移操作:', id);
      await moveCollectionDown(id);
    },

    updateItemOrder: async (orders: { id: number; order: number }[]): Promise<void> => {
      console.log('💾 [画集排序V2] 批量更新顺序:', orders);
      const collectionOrders = orders.map(order => ({
        id: order.id,
        displayOrder: order.order
      }));
      await updateCollectionOrder(collectionOrders);
    }
  };

  // 定义渲染函数
  const renderCollection = (collection: ArtCollection, index: number, isFirst: boolean, isLast: boolean) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <img
          src={collection.coverImage || '/placeholder-image.png'}
          alt={collection.title}
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ 
            margin: '0 0 4px 0', 
            color: '#1f2937', 
            fontSize: '16px', 
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {collection.title}
          </h4>
          <p style={{ 
            margin: '0 0 4px 0', 
            color: '#6b7280', 
            fontSize: '14px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {collection.artist}
          </p>
          {collection.category && (
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              background: '#dbeafe',
              color: '#1e40af',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '12px'
            }}>
              {collection.category}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <GenericOrderManager
      operations={operations}
      renderItem={renderCollection}
      title="画集排序管理"
      description="拖拽或使用按钮调整画集在前台的显示顺序"
      onOrderChanged={onOrderChanged}
      emptyMessage="暂无画集数据"
      loadingMessage="加载画集数据..."
    />
  );
} 