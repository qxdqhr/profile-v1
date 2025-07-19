/**
 * 新增配置项对话框组件
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Loader, AlertTriangle } from 'lucide-react';

interface ConfigCategory {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddConfigItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  environment: 'development' | 'production';
}

interface ConfigItemFormData {
  categoryId: string;
  key: string;
  displayName: string;
  description: string;
  value: string;
  defaultValue: string;
  type: 'string' | 'number' | 'boolean' | 'password';
  isRequired: boolean;
  isSensitive: boolean;
  validation: string;
  sortOrder: number;
}

export const AddConfigItemDialog: React.FC<AddConfigItemDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  environment
}) => {
  const [categories, setCategories] = useState<ConfigCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<ConfigItemFormData>({
    categoryId: '',
    key: '',
    displayName: '',
    description: '',
    value: '',
    defaultValue: '',
    type: 'string',
    isRequired: false,
    isSensitive: false,
    validation: '',
    sortOrder: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 加载配置分类
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/configManager/categories');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setCategories(data);
        // 设置默认分类
        if (data.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
      }
    } catch (error) {
      console.error('加载配置分类失败:', error);
      setError('加载配置分类失败');
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.categoryId) {
      newErrors.categoryId = '请选择配置分类';
    }

    if (!formData.key.trim()) {
      newErrors.key = '配置键不能为空';
    } else if (!/^[A-Z_][A-Z0-9_]*$/.test(formData.key)) {
      newErrors.key = '配置键只能包含大写字母、数字和下划线，且必须以字母或下划线开头';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = '显示名称不能为空';
    }

    if (formData.type === 'number' && formData.value && isNaN(Number(formData.value))) {
      newErrors.value = '请输入有效的数字';
    }

    if (formData.type === 'boolean' && formData.value && !['true', 'false'].includes(formData.value.toLowerCase())) {
      newErrors.value = '请输入 true 或 false';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/configManager/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          validation: formData.validation || null
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('配置项创建成功！');
        // 重置表单
        setFormData({
          categoryId: categories.length > 0 ? categories[0].id : '',
          key: '',
          displayName: '',
          description: '',
          value: '',
          defaultValue: '',
          type: 'string',
          isRequired: false,
          isSensitive: false,
          validation: '',
          sortOrder: 0
        });
        setErrors({});
        
        // 延迟关闭对话框
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(result.error || '创建配置项失败');
      }
    } catch (error) {
      console.error('创建配置项失败:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  // 处理输入变化
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

  // 初始化
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* 对话框 */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  新增配置项
                </h3>
                
                {/* 错误消息 */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-sm text-red-800">{error}</span>
                    </div>
                  </div>
                )}

                {/* 成功消息 */}
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <span className="text-sm text-green-800">{success}</span>
                    </div>
                  </div>
                )}

                {/* 表单 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 配置分类 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      配置分类 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => handleInputChange('categoryId', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.categoryId ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={loading}
                    >
                      <option value="">请选择配置分类</option>
                      {categories.map(category => (
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
                      onChange={(e) => handleInputChange('key', e.target.value.toUpperCase())}
                      placeholder="例如: MY_CONFIG_KEY"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.key ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={saving}
                    />
                    {errors.key && (
                      <p className="mt-1 text-sm text-red-600">{errors.key}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      只能包含大写字母、数字和下划线，且必须以字母或下划线开头
                    </p>
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
                      placeholder="例如: 我的配置项"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.displayName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={saving}
                    />
                    {errors.displayName && (
                      <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                    )}
                  </div>

                  {/* 描述 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      描述
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="配置项的详细描述"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={saving}
                    />
                  </div>

                  {/* 配置类型 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      配置类型 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={saving}
                    >
                      <option value="string">字符串 (string)</option>
                      <option value="number">数字 (number)</option>
                      <option value="boolean">布尔值 (boolean)</option>
                      <option value="password">密码 (password)</option>
                    </select>
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.value ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={saving}
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
                        placeholder="输入配置值"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.value ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={saving}
                      />
                    ) : (
                      <input
                        type={formData.type === 'number' ? 'number' : 'text'}
                        value={formData.value}
                        onChange={(e) => handleInputChange('value', e.target.value)}
                        placeholder="输入配置值"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.value ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={saving}
                      />
                    )}
                    {errors.value && (
                      <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                    )}
                  </div>

                  {/* 默认值 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      默认值
                    </label>
                    {formData.type === 'boolean' ? (
                      <select
                        value={formData.defaultValue}
                        onChange={(e) => handleInputChange('defaultValue', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={saving}
                      >
                        <option value="">请选择</option>
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : formData.type === 'password' ? (
                      <input
                        type="password"
                        value={formData.defaultValue}
                        onChange={(e) => handleInputChange('defaultValue', e.target.value)}
                        placeholder="输入默认值"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={saving}
                      />
                    ) : (
                      <input
                        type={formData.type === 'number' ? 'number' : 'text'}
                        value={formData.defaultValue}
                        onChange={(e) => handleInputChange('defaultValue', e.target.value)}
                        placeholder="输入默认值"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={saving}
                      />
                    )}
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
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={saving}
                    />
                  </div>

                  {/* 选项 */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isRequired"
                        checked={formData.isRequired}
                        onChange={(e) => handleInputChange('isRequired', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={saving}
                      />
                      <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-900">
                        必需配置项
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isSensitive"
                        checked={formData.isSensitive}
                        onChange={(e) => handleInputChange('isSensitive', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={saving}
                      />
                      <label htmlFor="isSensitive" className="ml-2 block text-sm text-gray-900">
                        敏感信息
                      </label>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  创建配置项
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 