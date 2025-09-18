/**
 * 活动创建器组件
 * 
 * 提供创建新活动的表单界面。
 * 支持基本信息填写、配置设置和数据克隆选项。
 */

'use client';

import React, { useState } from 'react';
import { Calendar, Save, X, Copy, Settings, Database } from 'lucide-react';
import { Event } from './EventSelector';

export interface EventFormData {
  name: string;
  slug: string;
  displayName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'draft' | 'active' | 'archived';
  isDefault: boolean;
  sortOrder: number;
  config?: Record<string, any>;
}

export interface CreateEventOptions {
  /** 是否创建默认配置 */
  createDefaultConfig: boolean;
  /** 是否克隆数据 */
  cloneData: boolean;
  /** 克隆来源活动ID */
  cloneFromEventId?: number;
  /** 是否克隆画集 */
  cloneCollections: boolean;
  /** 是否克隆作品 */
  cloneArtworks: boolean;
}

interface EventCreatorProps {
  /** 是否显示创建器 */
  visible: boolean;
  /** 关闭创建器回调 */
  onClose: () => void;
  /** 创建活动回调 */
  onCreateEvent: (eventData: EventFormData, options: CreateEventOptions) => Promise<void>;
  /** 可用于克隆的活动列表 */
  availableEvents: Event[];
  /** 是否正在创建 */
  creating?: boolean;
}

export function EventCreator({
  visible,
  onClose,
  onCreateEvent,
  availableEvents,
  creating = false
}: EventCreatorProps) {
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    slug: '',
    displayName: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'draft',
    isDefault: false,
    sortOrder: 0
  });

  const [options, setOptions] = useState<CreateEventOptions>({
    createDefaultConfig: true,
    cloneData: false,
    cloneFromEventId: undefined,
    cloneCollections: false,
    cloneArtworks: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '活动名称不能为空';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = '活动标识符不能为空';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = '标识符只能包含小写字母、数字和连字符';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = '显示名称不能为空';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '结束时间必须晚于开始时间';
    }

    if (options.cloneData && !options.cloneFromEventId) {
      newErrors.cloneFromEventId = '请选择要克隆的源活动';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onCreateEvent(formData, options);
      
      // 重置表单
      setFormData({
        name: '',
        slug: '',
        displayName: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'draft',
        isDefault: false,
        sortOrder: 0
      });
      
      setOptions({
        createDefaultConfig: true,
        cloneData: false,
        cloneFromEventId: undefined,
        cloneCollections: false,
        cloneArtworks: false
      });
      
      setErrors({});
      onClose();
      
    } catch (error) {
      console.error('创建活动失败:', error);
      setErrors({ submit: error instanceof Error ? error.message : '创建活动失败' });
    }
  };

  // 自动生成slug
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    }));
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">创建新活动</h2>
              <p className="text-sm text-gray-500">添加一个新的美术作品展览活动</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Settings size={20} />
              基本信息
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活动名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="第二期美术作品展"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活动标识符 *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.slug ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="event-2"
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                显示名称 *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.displayName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="第二期美术作品展览"
              />
              {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                活动描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="描述这次活动的主题和特色..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  开始时间
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  结束时间
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活动状态
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">草稿</option>
                  <option value="active">进行中</option>
                  <option value="archived">已结束</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  排序顺序
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                设为默认活动
              </label>
            </div>
          </div>

          {/* 数据克隆选项 */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Database size={20} />
              数据设置
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="createDefaultConfig"
                checked={options.createDefaultConfig}
                onChange={(e) => setOptions(prev => ({ ...prev, createDefaultConfig: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="createDefaultConfig" className="text-sm font-medium text-gray-700">
                创建默认配置
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cloneData"
                checked={options.cloneData}
                onChange={(e) => setOptions(prev => ({ 
                  ...prev, 
                  cloneData: e.target.checked,
                  cloneCollections: e.target.checked ? prev.cloneCollections : false,
                  cloneArtworks: e.target.checked ? prev.cloneArtworks : false
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="cloneData" className="text-sm font-medium text-gray-700">
                从现有活动克隆数据
              </label>
            </div>

            {options.cloneData && (
              <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择克隆来源 *
                  </label>
                  <select
                    value={options.cloneFromEventId || ''}
                    onChange={(e) => setOptions(prev => ({ ...prev, cloneFromEventId: parseInt(e.target.value) || undefined }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cloneFromEventId ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">选择要克隆的活动</option>
                    {availableEvents.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.displayName}
                      </option>
                    ))}
                  </select>
                  {errors.cloneFromEventId && <p className="text-red-500 text-sm mt-1">{errors.cloneFromEventId}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cloneCollections"
                    checked={options.cloneCollections}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      cloneCollections: e.target.checked,
                      cloneArtworks: e.target.checked ? prev.cloneArtworks : false
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="cloneCollections" className="text-sm font-medium text-gray-700">
                    克隆画集数据
                  </label>
                </div>

                {options.cloneCollections && (
                  <div className="flex items-center gap-2 ml-6">
                    <input
                      type="checkbox"
                      id="cloneArtworks"
                      checked={options.cloneArtworks}
                      onChange={(e) => setOptions(prev => ({ ...prev, cloneArtworks: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="cloneArtworks" className="text-sm font-medium text-gray-700">
                      同时克隆作品数据
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 错误信息 */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Save size={16} />
                  创建活动
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
