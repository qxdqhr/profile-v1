'use client';

import React from 'react';
import { CollectionOrderManagerV2 as CollectionOrderManager } from './CollectionOrderManagerV2';
import { ArtworkOrderManagerV2 as ArtworkOrderManager } from './ArtworkOrderManagerV2';

/**
 * 顺序管理组件使用示例
 * 
 * 展示如何使用基于通用组件的排序管理器
 */
export function OrderManagerExample() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>顺序管理组件示例</h1>
      
      <div style={{ marginBottom: '3rem' }}>
        <h2>画集顺序管理</h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          基于通用顺序管理器的画集排序组件，具有清晰的代码结构和良好的可维护性。
        </p>
        <CollectionOrderManager
          onOrderChanged={() => {
            console.log('🔄 [示例] 画集顺序已更新');
          }}
        />
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2>作品顺序管理</h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          基于通用顺序管理器的作品排序组件。请先选择一个画集ID进行测试。
        </p>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            画集ID (用于测试):
          </label>
          <input 
            type="number" 
            defaultValue={1}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              marginBottom: '1rem'
            }}
            id="collection-id-input"
          />
        </div>
        <ArtworkOrderManager
          collectionId={1} // 默认使用画集ID 1，实际使用时应该从父组件传入
          onOrderChanged={() => {
            console.log('🔄 [示例] 作品顺序已更新');
          }}
        />
      </div>

      <div style={{ 
        background: '#f8fafc', 
        border: '1px solid #e2e8f0', 
        borderRadius: '0.5rem', 
        padding: '1.5rem',
        marginTop: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>重构完成</h3>
        <ul style={{ margin: 0, color: '#4b5563' }}>
          <li><strong>✅ 组件替换：</strong>原有排序组件已被基于通用组件的新版本替换</li>
          <li><strong>✅ 代码复用：</strong>通用组件消除了重复代码，减少了维护成本</li>
          <li><strong>✅ 类型安全：</strong>使用TypeScript泛型确保类型安全</li>
          <li><strong>✅ 可扩展性：</strong>可以轻松为其他类型的数据创建排序管理器</li>
          <li><strong>✅ 一致性：</strong>所有排序组件具有统一的交互体验</li>
          <li><strong>✅ 向后兼容：</strong>原有组件作为过时版本保留，确保现有代码继续工作</li>
        </ul>
      </div>

      <div style={{ 
        background: '#ecfdf5', 
        border: '1px solid #10b981', 
        borderRadius: '0.5rem', 
        padding: '1.5rem',
        marginTop: '1rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#065f46' }}>架构优势</h3>
        <p style={{ margin: 0, color: '#047857' }}>
          新的排序组件架构基于通用组件设计，现在 `CollectionOrderManager` 和 `ArtworkOrderManager` 
          实际上是基于 `GenericOrderManager` 的特化实现，大大提高了代码的可复用性和可维护性。
          原有的复杂逻辑现在被封装在通用组件中，特化组件只需要提供数据操作函数和渲染函数即可。
        </p>
      </div>
    </div>
  );
} 