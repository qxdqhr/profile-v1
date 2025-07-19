'use client';

import React, { useState, useEffect } from 'react';
import { ConfigCategory, ConfigItem } from '../types';
import { ConfigCategoryList } from '../components/ConfigCategoryList';
import { ConfigItemList } from '../components/ConfigItemList';
import { ConfigItemForm } from '../components/ConfigItemForm';
import { ConfigCategoryForm } from '../components/ConfigCategoryForm';

export const ConfigManagerPage: React.FC = () => {
  const [categories, setCategories] = useState<ConfigCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ConfigCategory | null>(null);
  const [configItems, setConfigItems] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);

  // 加载配置分类
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/configManager/categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
        if (result.data.length > 0 && !selectedCategory) {
          setSelectedCategory(result.data[0]);
        }
      }
    } catch (error) {
      console.error('加载配置分类失败:', error);
    }
  };

  // 加载配置项
  const loadConfigItems = async (categoryId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/configManager/items?categoryId=${categoryId}`);
      const result = await response.json();
      
      if (result.success) {
        setConfigItems(result.data.items);
      }
    } catch (error) {
      console.error('加载配置项失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理分类选择
  const handleCategorySelect = (category: ConfigCategory) => {
    setSelectedCategory(category);
    loadConfigItems(category.id);
  };

  // 处理配置项更新
  const handleConfigItemUpdate = async (updates: Array<{ id: string; value: string }>) => {
    try {
      const response = await fetch('/api/configManager/items', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });

      const result = await response.json();
      
      if (result.success) {
        // 重新加载配置项
        if (selectedCategory) {
          loadConfigItems(selectedCategory.id);
        }
        alert('配置更新成功');
      } else {
        alert('配置更新失败: ' + result.error);
      }
    } catch (error) {
      console.error('更新配置失败:', error);
      alert('更新配置失败');
    }
  };

  // 处理分类创建
  const handleCategoryCreate = async (categoryData: any) => {
    try {
      const response = await fetch('/api/configManager/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowCategoryForm(false);
        loadCategories();
        alert('分类创建成功');
      } else {
        alert('分类创建失败: ' + result.error);
      }
    } catch (error) {
      console.error('创建分类失败:', error);
      alert('创建分类失败');
    }
  };

  // 处理配置项创建
  const handleItemCreate = async (itemData: any) => {
    try {
      const response = await fetch('/api/configManager/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowItemForm(false);
        if (selectedCategory) {
          loadConfigItems(selectedCategory.id);
        }
        alert('配置项创建成功');
      } else {
        alert('配置项创建失败: ' + result.error);
      }
    } catch (error) {
      console.error('创建配置项失败:', error);
      alert('创建配置项失败');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadConfigItems(selectedCategory.id);
    }
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">配置管理</h1>
          <p className="mt-2 text-gray-600">
            管理系统配置项，包括OSS、数据库等环境配置
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧分类列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">配置分类</h2>
                  <button
                    onClick={() => setShowCategoryForm(true)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    新增
                  </button>
                </div>
              </div>
              <ConfigCategoryList
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />
            </div>
          </div>

          {/* 右侧配置项列表 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    {selectedCategory ? selectedCategory.displayName : '请选择分类'}
                  </h2>
                  {selectedCategory && (
                    <button
                      onClick={() => setShowItemForm(true)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      新增配置
                    </button>
                  )}
                </div>
              </div>
              
              {selectedCategory ? (
                <ConfigItemList
                  items={configItems}
                  loading={loading}
                  onUpdateItems={handleConfigItemUpdate}
                  onEditItem={(item) => {
                    setEditingItem(item);
                    setShowItemForm(true);
                  }}
                />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  请选择一个配置分类
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 分类表单模态框 */}
        {showCategoryForm && (
          <ConfigCategoryForm
            onClose={() => setShowCategoryForm(false)}
            onSubmit={handleCategoryCreate}
          />
        )}

        {/* 配置项表单模态框 */}
        {showItemForm && (
          <ConfigItemForm
            categories={categories}
            editingItem={editingItem}
            onClose={() => {
              setShowItemForm(false);
              setEditingItem(null);
            }}
            onSubmit={handleItemCreate}
          />
        )}
      </div>
    </div>
  );
}; 