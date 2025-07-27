/**
 * 导出配置编辑器组件
 * 
 * 提供可视化的导出字段配置编辑功能
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  MoveUp, 
  MoveDown, 
  Save, 
  X,
  Download,
  FileText,
  Calendar,
  Hash,
  DollarSign,
  CheckSquare,
  Square,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

import type { 
  ExportConfig, 
  ExportField, 
  FieldType, 
  FieldAlignment,
  ExportFormat 
} from '../../services/universalExport';

// ============= 类型定义 =============

export interface ExportConfigEditorProps {
  /** 初始配置 */
  initialConfig?: ExportConfig;
  /** 模块标识 */
  moduleId: string;
  /** 业务标识 */
  businessId?: string;
  /** 可用的字段定义 */
  availableFields: ExportField[];
  /** 保存配置回调 */
  onSave?: (config: ExportConfig) => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 是否显示 */
  visible?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

// ============= 字段类型图标映射 =============

const FIELD_TYPE_ICONS: Record<FieldType, React.ReactNode> = {
  string: <Type className="w-4 h-4" />,
  number: <Hash className="w-4 h-4" />,
  date: <Calendar className="w-4 h-4" />,
  boolean: <CheckSquare className="w-4 h-4" />,
  array: <FileText className="w-4 h-4" />,
  object: <FileText className="w-4 h-4" />,
};

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  string: '文本',
  number: '数字',
  date: '日期',
  boolean: '布尔',
  array: '数组',
  object: '对象',
};

const ALIGNMENT_ICONS: Record<FieldAlignment, React.ReactNode> = {
  left: <AlignLeft className="w-4 h-4" />,
  center: <AlignCenter className="w-4 h-4" />,
  right: <AlignRight className="w-4 h-4" />,
};

const ALIGNMENT_LABELS: Record<FieldAlignment, string> = {
  left: '左对齐',
  center: '居中对齐',
  right: '右对齐',
};

// ============= 主组件 =============

export const ExportConfigEditor: React.FC<ExportConfigEditorProps> = ({
  initialConfig,
  moduleId,
  businessId,
  availableFields,
  onSave,
  onCancel,
  visible = false,
  className = '',
}) => {
  // ============= 状态管理 =============
  
  const [config, setConfig] = useState<ExportConfig>(() => {
    if (initialConfig) {
      return { ...initialConfig };
    }
    
    // 创建默认配置
    return {
      id: '',
      name: '新建导出配置',
      description: '',
      format: 'csv',
      fields: availableFields.map((field, index) => ({
        ...field,
        enabled: true,
        sortOrder: index,
      })),
      fileNameTemplate: '导出数据_{date}',
      includeHeader: true,
      delimiter: ',',
      encoding: 'utf-8',
      addBOM: true,
      maxRows: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      moduleId,
      businessId,
    };
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ============= 字段管理 =============

  const toggleFieldEnabled = useCallback((fieldKey: string) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.key === fieldKey
          ? { ...field, enabled: !field.enabled }
          : field
      ),
    }));
  }, []);

  const updateField = useCallback((fieldKey: string, updates: Partial<ExportField>) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.key === fieldKey
          ? { ...field, ...updates }
          : field
      ),
    }));
  }, []);

  const moveField = useCallback((fieldKey: string, direction: 'up' | 'down') => {
    setConfig(prev => {
      const fields = [...prev.fields];
      const index = fields.findIndex(f => f.key === fieldKey);
      
      if (direction === 'up' && index > 0) {
        [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];
      } else if (direction === 'down' && index < fields.length - 1) {
        [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
      }
      
      return {
        ...prev,
        fields: fields.map((field, idx) => ({ ...field, sortOrder: idx })),
      };
    });
  }, []);

  const addField = useCallback((field: ExportField) => {
    setConfig(prev => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          ...field,
          enabled: true,
          sortOrder: prev.fields.length,
        },
      ],
    }));
  }, []);

  const removeField = useCallback((fieldKey: string) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.key !== fieldKey),
    }));
  }, []);

  // ============= 保存配置 =============

  const handleSave = useCallback(() => {
    if (!config.name.trim()) {
      alert('请输入配置名称');
      return;
    }

    const enabledFields = config.fields.filter(f => f.enabled);
    if (enabledFields.length === 0) {
      alert('至少需要启用一个字段');
      return;
    }

    const updatedConfig: ExportConfig = {
      ...config,
      updatedAt: new Date(),
    };

    onSave?.(updatedConfig);
  }, [config, onSave]);

  // ============= 渲染字段项 =============

  const renderFieldItem = (field: ExportField, index: number) => {
    const isEditing = editingField === field.key;
    const isFirst = index === 0;
    const isLast = index === config.fields.length - 1;

    return (
      <div
        key={field.key}
        className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 border rounded-lg transition-colors ${
          field.enabled 
            ? 'bg-white border-gray-200 hover:border-blue-300' 
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        {/* 第一行：主要信息和操作 */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* 启用/禁用开关 */}
          <button
            onClick={() => toggleFieldEnabled(field.key)}
            className={`p-1 rounded transition-colors flex-shrink-0 ${
              field.enabled 
                ? 'text-blue-600 hover:bg-blue-50' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={field.enabled ? '禁用字段' : '启用字段'}
          >
            {field.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* 字段类型图标 */}
          <div className="flex-shrink-0 text-gray-500">
            {FIELD_TYPE_ICONS[field.type]}
          </div>

          {/* 字段信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-gray-900 truncate text-sm sm:text-base">
                {field.label}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded self-start sm:self-auto">
                {field.key}
              </span>
            </div>
            {field.description && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                {field.description}
              </p>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* 上移 */}
            <button
              onClick={() => moveField(field.key, 'up')}
              disabled={isFirst}
              className={`p-1 rounded transition-colors ${
                isFirst 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="上移"
            >
              <MoveUp className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>

            {/* 下移 */}
            <button
              onClick={() => moveField(field.key, 'down')}
              disabled={isLast}
              className={`p-1 rounded transition-colors ${
                isLast 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="下移"
            >
              <MoveDown className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>

            {/* 删除 */}
            <button
              onClick={() => removeField(field.key)}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="删除字段"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* 第二行：字段设置（仅在启用时显示） */}
        {field.enabled && (
          <div className="flex items-center gap-2 sm:gap-3 pt-2 sm:pt-0 sm:border-t-0 border-t border-gray-100">
            {/* 对齐方式 */}
            <div className="flex items-center gap-1">
              <label className="text-xs text-gray-600 whitespace-nowrap">对齐:</label>
              <select
                value={field.alignment || 'left'}
                onChange={(e) => updateField(field.key, { alignment: e.target.value as FieldAlignment })}
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white min-w-0"
                title="对齐方式"
              >
                {Object.entries(ALIGNMENT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* 宽度设置 */}
            <div className="flex items-center gap-1">
              <label className="text-xs text-gray-600 whitespace-nowrap">宽度:</label>
              <input
                type="number"
                value={field.width || ''}
                onChange={(e) => updateField(field.key, { width: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="自动"
                className="w-16 text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                title="字段宽度"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============= 渲染组件 =============

  if (!visible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                导出配置编辑器
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                配置导出字段和格式选项
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 h-full">
            {/* 左侧：基本配置 */}
            <div className="space-y-4 sm:space-y-6 overflow-y-auto">
              {/* 基本信息 */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">基本信息</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      配置名称 *
                    </label>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="输入配置名称"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      描述
                    </label>
                    <textarea
                      value={config.description}
                      onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="输入配置描述"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      导出格式
                    </label>
                    <select
                      value={config.format}
                      onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as ExportFormat }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="csv">CSV</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 高级选项 */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">高级选项</h3>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showAdvanced ? '隐藏' : '显示'}
                  </button>
                </div>

                {showAdvanced && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        文件名模板
                      </label>
                      <input
                        type="text"
                        value={config.fileNameTemplate}
                        onChange={(e) => setConfig(prev => ({ ...prev, fileNameTemplate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例如：导出数据_{date}"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        支持变量：{' '}
                        <code className="bg-gray-100 px-1 rounded">{'{date}'}</code>
                        {' '}
                        <code className="bg-gray-100 px-1 rounded">{'{time}'}</code>
                        {' '}
                        <code className="bg-gray-100 px-1 rounded">{'{timestamp}'}</code>
                      </p>
                    </div>

                    {config.format === 'csv' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            分隔符
                          </label>
                          <input
                            type="text"
                            value={config.delimiter}
                            onChange={(e) => setConfig(prev => ({ ...prev, delimiter: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder=","
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={config.includeHeader}
                              onChange={(e) => setConfig(prev => ({ ...prev, includeHeader: e.target.checked }))}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">包含表头</span>
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={config.addBOM}
                              onChange={(e) => setConfig(prev => ({ ...prev, addBOM: e.target.checked }))}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">添加BOM</span>
                          </label>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        最大行数限制
                      </label>
                      <input
                        type="number"
                        value={config.maxRows || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, maxRows: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="不限制"
                        min="1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：字段配置 */}
            <div className="space-y-3 sm:space-y-4 flex flex-col h-full">
              <div className="flex items-center justify-between flex-shrink-0">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">字段配置</h3>
                <div className="text-sm text-gray-500">
                  已启用 {config.fields.filter(f => f.enabled).length} / {config.fields.length} 个字段
                </div>
              </div>

              {/* 字段列表 */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {config.fields.map((field, index) => renderFieldItem(field, index))}
              </div>

              {/* 添加字段 */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 flex-shrink-0">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    所有可用字段已添加
                  </p>
                  <p className="text-xs text-gray-400">
                    如需添加新字段，请先在数据源中定义
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={onCancel}
            className="px-3 sm:px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-3 sm:px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}; 