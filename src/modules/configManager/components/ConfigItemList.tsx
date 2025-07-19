'use client';

import React, { useState } from 'react';
import { ConfigItem } from '../types';

interface ConfigItemListProps {
  items: ConfigItem[];
  loading: boolean;
  onUpdateItems: (updates: Array<{ id: string; value: string }>) => void;
  onEditItem: (item: ConfigItem) => void;
}

export const ConfigItemList: React.FC<ConfigItemListProps> = ({
  items,
  loading,
  onUpdateItems,
  onEditItem,
}) => {
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // 处理值变更
  const handleValueChange = (itemId: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [itemId]: value
    }));
    setHasChanges(true);
  };

  // 处理保存
  const handleSave = () => {
    const updates = Object.entries(editingValues).map(([id, value]) => ({
      id,
      value
    }));
    
    onUpdateItems(updates);
    setEditingValues({});
    setHasChanges(false);
  };

  // 处理取消
  const handleCancel = () => {
    setEditingValues({});
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-500">加载中...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        该分类下暂无配置项
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 操作按钮 */}
      {hasChanges && (
        <div className="mb-4 flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            保存更改
          </button>
        </div>
      )}

      {/* 配置项列表 */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {item.displayName}
                  </h3>
                  {item.isRequired && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      必填
                    </span>
                  )}
                  {item.isSensitive && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      敏感
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-1">
                  键名: {item.key}
                </p>
                
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEditItem(item)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  编辑
                </button>
              </div>
            </div>

            {/* 配置值输入 */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                配置值
              </label>
              
              {item.type === 'boolean' ? (
                <select
                  value={editingValues[item.id] ?? item.value}
                  onChange={(e) => handleValueChange(item.id, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : item.type === 'password' ? (
                <input
                  type="password"
                  value={editingValues[item.id] ?? item.value}
                  onChange={(e) => handleValueChange(item.id, e.target.value)}
                  placeholder={item.defaultValue || '请输入配置值'}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              ) : item.type === 'json' ? (
                <textarea
                  value={editingValues[item.id] ?? item.value}
                  onChange={(e) => handleValueChange(item.id, e.target.value)}
                  placeholder={item.defaultValue || '请输入JSON格式的配置值'}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              ) : (
                <input
                  type="text"
                  value={editingValues[item.id] ?? item.value}
                  onChange={(e) => handleValueChange(item.id, e.target.value)}
                  placeholder={item.defaultValue || '请输入配置值'}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              )}
              
              {item.defaultValue && (
                <p className="text-xs text-gray-500 mt-1">
                  默认值: {item.defaultValue}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 