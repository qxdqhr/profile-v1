'use client';

import React, { useState, useEffect } from 'react';
import { ConfigCategory, ConfigItem, ConfigItemType } from '../types';

interface ConfigItemFormProps {
  categories: ConfigCategory[];
  editingItem: ConfigItem | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const ConfigItemForm: React.FC<ConfigItemFormProps> = ({
  categories,
  editingItem,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    key: '',
    displayName: '',
    description: '',
    value: '',
    defaultValue: '',
    type: 'string' as ConfigItemType,
    isRequired: false,
    isSensitive: false,
    sortOrder: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初始化表单数据
  useEffect(() => {
    if (editingItem) {
      setFormData({
        categoryId: editingItem.categoryId || '',
        key: editingItem.key,
        displayName: editingItem.displayName,
        description: editingItem.description || '',
        value: editingItem.value || '',
        defaultValue: editingItem.defaultValue || '',
        type: editingItem.type as ConfigItemType,
        isRequired: editingItem.isRequired || false,
        isSensitive: editingItem.isSensitive || false,
        sortOrder: editingItem.sortOrder || 0,
      });
    } else {
      // 设置默认分类
      if (categories.length > 0) {
        setFormData(prev => ({
          ...prev,
          categoryId: categories[0].id
        }));
      }
    }
  }, [editingItem, categories]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.categoryId) {
      newErrors.categoryId = '请选择配置分类';
    }

    if (!formData.key.trim()) {
      newErrors.key = '配置键不能为空';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = '显示名称不能为空';
    }

    if (formData.type === 'json' && formData.value) {
      try {
        JSON.parse(formData.value);
      } catch {
        newErrors.value = 'JSON格式不正确';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingItem ? '编辑配置项' : '新增配置项'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 配置分类 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  配置分类 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.categoryId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">请选择分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.displayName}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                )}
              </div>

              {/* 配置键 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  配置键 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => handleInputChange('key', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.key ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="请输入配置键"
                  disabled={!!editingItem}
                />
                {errors.key && (
                  <p className="mt-1 text-sm text-red-600">{errors.key}</p>
                )}
              </div>

              {/* 显示名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  显示名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.displayName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="请输入显示名称"
                />
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                )}
              </div>

              {/* 配置类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  配置类型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as ConfigItemType)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={!!editingItem}
                >
                  <option value="string">字符串</option>
                  <option value="number">数字</option>
                  <option value="boolean">布尔值</option>
                  <option value="json">JSON</option>
                  <option value="password">密码</option>
                </select>
              </div>

              {/* 排序 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  排序
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0"
                />
              </div>

              {/* 必填 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={formData.isRequired}
                  onChange={(e) => handleInputChange('isRequired', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-900">
                  必填项
                </label>
              </div>

              {/* 敏感信息 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isSensitive"
                  checked={formData.isSensitive}
                  onChange={(e) => handleInputChange('isSensitive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isSensitive" className="ml-2 block text-sm text-gray-900">
                  敏感信息
                </label>
              </div>
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="请输入配置项描述"
              />
            </div>

            {/* 默认值 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                默认值
              </label>
              <input
                type="text"
                value={formData.defaultValue}
                onChange={(e) => handleInputChange('defaultValue', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="请输入默认值"
              />
            </div>

            {/* 配置值 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                配置值
              </label>
              {formData.type === 'boolean' ? (
                <select
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">请选择</option>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : formData.type === 'password' ? (
                <input
                  type="password"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.value ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="请输入配置值"
                />
              ) : formData.type === 'json' ? (
                <textarea
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  rows={4}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.value ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="请输入JSON格式的配置值"
                />
              ) : (
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.value ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="请输入配置值"
                />
              )}
              {errors.value && (
                <p className="mt-1 text-sm text-red-600">{errors.value}</p>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                {editingItem ? '更新' : '创建'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 