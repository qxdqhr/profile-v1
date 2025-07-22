'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { GenericOrderManager } from '@/components/GenericOrderManager';
import { 
  getArtworksByCollection,
  updateArtworkOrder,
  moveArtworkUp,
  moveArtworkDown
} from '../services/masterpiecesConfigService';
import type { ArtworkPage } from '../types';

interface ArtworkOrderManagerV2Props {
  collectionId: number;
  onOrderChanged?: () => void;
}

type ArtworkWithOrder = ArtworkPage & { pageOrder: number };

export function ArtworkOrderManagerV2({ collectionId, onOrderChanged }: ArtworkOrderManagerV2Props) {
  // 定义操作函数
  const operations = {
    loadItems: async (): Promise<ArtworkWithOrder[]> => {
      console.log('📋 [作品排序V2] 开始加载作品数据...', { collectionId });
      const data = await getArtworksByCollection(collectionId);
      console.log('📋 [作品排序V2] 加载作品数据完成:', {
        collectionId,
        artworksCount: data.length,
        artworks: data.map(a => ({ id: a.id, title: a.title, pageOrder: a.pageOrder }))
      });
      return data;
    },

    moveItemUp: async (id: number): Promise<void> => {
      console.log('⬆️ [作品排序V2] 执行上移操作:', { collectionId, artworkId: id });
      await moveArtworkUp(collectionId, id);
    },

    moveItemDown: async (id: number): Promise<void> => {
      console.log('⬇️ [作品排序V2] 执行下移操作:', { collectionId, artworkId: id });
      await moveArtworkDown(collectionId, id);
    },

    updateItemOrder: async (orders: { id: number; order: number }[]): Promise<void> => {
      console.log('💾 [作品排序V2] 批量更新顺序:', { collectionId, orders });
      
      // orders数组已经按照items的当前顺序排列，直接使用索引作为pageOrder
      const artworkOrders = orders.map((order, index) => {
        console.log(`转换映射: id=${order.id}, 数组索引=${index}, pageOrder=${index}`);
        return {
          id: order.id,
          pageOrder: index // 直接使用索引，从0开始递增
        };
      });
      
      console.log('💾 [作品排序V2] 转换后的pageOrder:', { 
        collectionId, 
        artworkOrders: artworkOrders.map(ao => ({ id: ao.id, pageOrder: ao.pageOrder }))
      });
      
      await updateArtworkOrder(collectionId, artworkOrders);
    }
  };

  // 定义渲染函数
  const renderArtwork = (artwork: ArtworkWithOrder, index: number, isFirst: boolean, isLast: boolean) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          background: '#f9fafb',
          flexShrink: 0
        }}>
          {artwork.image ? (
            <img
              src={artwork.image}
              alt={artwork.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const placeholder = target.parentElement?.querySelector('.placeholder') as HTMLElement;
                if (placeholder) {
                  placeholder.style.display = 'flex';
                }
              }}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              color: '#9ca3af',
              background: '#f3f4f6'
            }}>
              <ImageIcon size={24} />
            </div>
          )}
          <div className="placeholder" style={{ 
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            color: '#9ca3af',
            background: '#f3f4f6'
          }}>
            <ImageIcon size={24} />
          </div>
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ 
            margin: '0 0 4px 0', 
            color: '#1f2937', 
            fontSize: '16px', 
            fontWeight: 600,
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {artwork.title}
          </h4>
          <p style={{ 
            margin: '0 0 4px 0', 
            color: '#6b7280', 
            fontSize: '14px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            作者：{artwork.artist}
          </p>
          {artwork.createdTime && (
            <p style={{ 
              margin: '0 0 4px 0', 
              color: '#6b7280', 
              fontSize: '14px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              创作时间：{artwork.createdTime}
            </p>
          )}
          {artwork.theme && (
            <span style={{
              display: 'inline-block',
              background: '#dbeafe',
              color: '#1d4ed8',
              fontSize: '12px',
              padding: '2px 6px',
              borderRadius: '4px',
              marginRight: '6px'
            }}>
              {artwork.theme}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <GenericOrderManager
      operations={operations}
      renderItem={renderArtwork}
      title="作品排序管理"
      description="拖拽或使用按钮调整作品在画集中的显示顺序"
      onOrderChanged={onOrderChanged}
      emptyMessage="暂无作品数据"
      loadingMessage="加载作品数据..."
    />
  );
} 