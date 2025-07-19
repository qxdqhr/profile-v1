/**
 * 配置管理页面
 * 
 * 使用简化的配置管理组件，显示所有配置项的列表
 */

'use client';

import React from 'react';
import { SimpleConfigManager } from '../components/SimpleConfigManager';

export const ConfigManagerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">配置管理</h1>
          <p className="mt-2 text-gray-600">
            管理系统配置项，所有配置项都可以直接编辑
          </p>
        </div>
        
        <SimpleConfigManager />
      </div>
    </div>
  );
}; 