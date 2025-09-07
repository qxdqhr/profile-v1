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
  AlignRight,
  Group,
  GitMerge,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
  Database
} from 'lucide-react';

import type { 
  ExportConfig, 
  ExportField, 
  FieldType, 
  FieldAlignment,
  ExportFormat,
  GroupingConfig,
  GroupingField,
  GroupingMode,
  GroupValueProcessing
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
  /** 配置变化回调(新增/删除/更新) */
  onConfigChange?: () => void;
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

// ============= 分组相关标签 =============

const GROUPING_MODE_LABELS: Record<GroupingMode, string> = {
  merge: '合并模式',
  separate: '分离模式',
  nested: '嵌套模式',
};

const GROUPING_MODE_DESCRIPTIONS: Record<GroupingMode, string> = {
  merge: '同组数据合并显示，Excel支持单元格合并',
  separate: '每个分组独立显示，可添加分组头',
  nested: '支持多级嵌套分组',
};

const VALUE_PROCESSING_LABELS: Record<GroupValueProcessing, string> = {
  first: '取第一个值',
  last: '取最后一个值',
  concat: '连接所有值',
  sum: '求和',
  count: '计数',
  custom: '自定义处理',
};

const GROUPING_MODE_ICONS: Record<GroupingMode, React.ReactNode> = {
  merge: <GitMerge className="w-4 h-4" />,
  separate: <Layers className="w-4 h-4" />,
  nested: <ArrowUpDown className="w-4 h-4" />,
};

const FORMAT_ICONS: Record<ExportFormat, React.ReactNode> = {
  csv: <FileText className="w-4 h-4" />,
  excel: <FileSpreadsheet className="w-4 h-4" />,
  json: <Database className="w-4 h-4" />,
};

const FORMAT_DESCRIPTIONS: Record<ExportFormat, string> = {
  csv: '逗号分隔值文件，兼容性最好',
  excel: 'Excel表格文件，支持格式化和单元格合并',
  json: 'JSON数据文件，适合开发者使用',
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
  onConfigChange,
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
      grouping: {
        enabled: false,
        fields: [],
        preserveOrder: true,
        nullValueHandling: 'separate',
        nullGroupName: '未分组'
      },
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
  const [activeTab, setActiveTab] = useState<'basic' | 'fields' | 'grouping' | 'manage'>('basic');
  
  // 配置管理相关状态
  const [savedConfigs, setSavedConfigs] = useState<ExportConfig[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [deletingConfigId, setDeletingConfigId] = useState<string | null>(null);

  // 加载已保存的配置
  const loadSavedConfigs = useCallback(async () => {
    if (!visible || activeTab !== 'manage') return;
    
    setLoadingConfigs(true);
    try {
      const params = new URLSearchParams({ moduleId });
      if (businessId) {
        params.set('businessId', businessId);
      }
      
      const response = await fetch(`/api/universal-export/configs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSavedConfigs(data.configs || []);
        console.log('🔍 [ExportConfigEditor] 加载配置成功:', data.configs?.length || 0, '个配置');
      } else {
        console.error('🔍 [ExportConfigEditor] 加载配置失败:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('🔍 [ExportConfigEditor] 加载配置异常:', error);
    } finally {
      setLoadingConfigs(false);
    }
  }, [visible, activeTab, moduleId, businessId]);

  // 删除配置
  const deleteConfig = useCallback(async (configId: string) => {
    setDeletingConfigId(configId);
    try {
      const response = await fetch(`/api/universal-export/configs/${configId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSavedConfigs(prev => prev.filter(cfg => cfg.id !== configId));
        // 通知外部组件配置已变化
        onConfigChange?.();
        console.log('🔄 [ExportConfigEditor] 配置删除成功，通知外部组件刷新');
      }
    } catch (error) {
      console.error('删除配置失败:', error);
    } finally {
      setDeletingConfigId(null);
    }
  }, [onConfigChange]);

  // 加载配置到编辑器
  const loadConfigToEditor = useCallback((config: ExportConfig) => {
    setConfig(config);
    setActiveTab('basic');
  }, []);

  // 当切换到管理tab时加载配置
  useEffect(() => {
    if (activeTab === 'manage') {
      loadSavedConfigs();
    }
  }, [activeTab, loadSavedConfigs]);

  // 阻止背景滚动
  useEffect(() => {
    if (visible) {
      // 保存当前滚动位置
      const scrollY = window.scrollY;
      
      // 阻止背景滚动
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      
      // 添加键盘事件监听器
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel?.();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        // 恢复滚动
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
        
        // 移除事件监听器
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [visible, onCancel]);

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

  // ============= 分组配置管理 =============

  const toggleGrouping = useCallback((enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      grouping: {
        ...prev.grouping!,
        enabled,
      },
    }));
  }, []);

  const addGroupingField = useCallback((fieldKey: string) => {
    const field = config.fields.find(f => f.key === fieldKey);
    if (!field) return;

    const groupField: GroupingField = {
      key: field.key,
      label: field.label,
      mode: 'merge',
      valueProcessing: 'first',
      showGroupHeader: false,
      mergeCells: true,
    };

    setConfig(prev => ({
      ...prev,
      grouping: {
        ...prev.grouping!,
        fields: [...prev.grouping!.fields, groupField],
      },
    }));
  }, [config.fields]);

  const removeGroupingField = useCallback((fieldKey: string) => {
    setConfig(prev => ({
      ...prev,
      grouping: {
        ...prev.grouping!,
        fields: prev.grouping!.fields.filter(f => f.key !== fieldKey),
      },
    }));
  }, []);

  const updateGroupingField = useCallback((fieldKey: string, updates: Partial<GroupingField>) => {
    setConfig(prev => ({
      ...prev,
      grouping: {
        ...prev.grouping!,
        fields: prev.grouping!.fields.map(field =>
          field.key === fieldKey
            ? { ...field, ...updates }
            : field
        ),
      },
    }));
  }, []);

  const moveGroupingField = useCallback((fieldKey: string, direction: 'up' | 'down') => {
    setConfig(prev => {
      const fields = [...prev.grouping!.fields];
      const index = fields.findIndex(f => f.key === fieldKey);
      
      if (direction === 'up' && index > 0) {
        [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];
      } else if (direction === 'down' && index < fields.length - 1) {
        [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
      }
      
      return {
        ...prev,
        grouping: {
          ...prev.grouping!,
          fields,
        },
      };
    });
  }, []);

  const updateGroupingConfig = useCallback((updates: Partial<GroupingConfig>) => {
    setConfig(prev => ({
      ...prev,
      grouping: {
        ...prev.grouping!,
        ...updates,
      },
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
    
    // 通知外部组件配置已变化
    onConfigChange?.();
    console.log('🔄 [ExportConfigEditor] 配置保存成功，通知外部组件刷新');
  }, [config, onSave, onConfigChange]);

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

  // ============= 渲染分组配置 =============

  const renderGroupingField = (groupField: GroupingField, index: number) => {
    const isFirst = index === 0;
    const isLast = index === (config.grouping?.fields.length || 1) - 1;

    return (
      <div
        key={groupField.key}
        className="flex flex-col gap-3 p-4 border rounded-lg bg-blue-50 border-blue-200"
      >
        {/* 分组字段头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Group className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">
              {groupField.label}
            </span>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
              {groupField.key}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* 上移 */}
            <button
              onClick={() => moveGroupingField(groupField.key, 'up')}
              disabled={isFirst}
              className={`p-1 rounded transition-colors ${
                isFirst 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-blue-600 hover:bg-blue-100'
              }`}
              title="上移"
            >
              <MoveUp className="w-4 h-4" />
            </button>

            {/* 下移 */}
            <button
              onClick={() => moveGroupingField(groupField.key, 'down')}
              disabled={isLast}
              className={`p-1 rounded transition-colors ${
                isLast 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-blue-600 hover:bg-blue-100'
              }`}
              title="下移"
            >
              <MoveDown className="w-4 h-4" />
            </button>

            {/* 删除 */}
            <button
              onClick={() => removeGroupingField(groupField.key)}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="删除分组字段"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 分组配置选项 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 分组模式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分组模式
            </label>
            <select
              value={groupField.mode}
              onChange={(e) => updateGroupingField(groupField.key, { mode: e.target.value as GroupingMode })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {Object.entries(GROUPING_MODE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {GROUPING_MODE_DESCRIPTIONS[groupField.mode]}
            </p>
          </div>

          {/* 值处理方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              值处理方式
            </label>
            <select
              value={groupField.valueProcessing}
              onChange={(e) => updateGroupingField(groupField.key, { valueProcessing: e.target.value as GroupValueProcessing })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {Object.entries(VALUE_PROCESSING_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 其他选项 */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={groupField.showGroupHeader}
              onChange={(e) => updateGroupingField(groupField.key, { showGroupHeader: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">显示分组头</span>
          </label>

          {config.format === 'excel' && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={groupField.mergeCells}
                onChange={(e) => updateGroupingField(groupField.key, { mergeCells: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">合并单元格</span>
            </label>
          )}
        </div>

        {/* 分组头模板 */}
        {groupField.showGroupHeader && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分组头模板
            </label>
            <input
              type="text"
              value={groupField.groupHeaderTemplate || ''}
              onChange={(e) => updateGroupingField(groupField.key, { groupHeaderTemplate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="使用 {value} 表示分组值，如：用户: {value}"
            />
          </div>
        )}
      </div>
    );
  };

  // ============= 渲染组件 =============

  if (!visible) {
    return null;
  }

  // Tab定义
  const tabs = [
    { 
      id: 'basic' as const, 
      label: '基本配置', 
      icon: <Settings className="w-4 h-4" />,
      description: '配置名称、格式和基本选项'
    },
    { 
      id: 'fields' as const, 
      label: '字段设置', 
      icon: <Type className="w-4 h-4" />,
      description: '选择和配置导出字段'
    },
    { 
      id: 'grouping' as const, 
      label: '分组设置', 
      icon: <Group className="w-4 h-4" />,
      description: '配置数据分组和合并选项'
    },
    { 
      id: 'manage' as const, 
      label: '配置管理', 
      icon: <Database className="w-4 h-4" />,
      description: '管理已保存的导出配置'
    },
  ];

  const handleModalClick = (e: React.MouseEvent) => {
    // 阻止点击模态窗口内部时关闭
    e.stopPropagation();
  };

  const handleOverlayClick = () => {
    // 点击遮罩层关闭模态窗口
    onCancel?.();
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={handleModalClick}
      >
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

        {/* Tab导航 */}
        <div className="border-b bg-gray-50 flex-shrink-0">
          <nav className="flex space-x-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }
                `}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split('')[0]}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab内容 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 当前Tab的内容描述 */}
          <div className="bg-blue-50 border-b border-blue-100 p-4 flex-shrink-0">
            <div className="flex items-center gap-2 text-blue-800">
              {tabs.find(t => t.id === activeTab)?.icon}
              <span className="text-sm font-medium">
                {tabs.find(t => t.id === activeTab)?.description}
              </span>
            </div>
          </div>

          {/* 滚动内容区域 */}
          <div 
            className="flex-1 overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#CBD5E0 #F7FAFC'
            }}
          >
            <div className="p-4 sm:p-6">
              {/* 基本配置Tab */}
              {activeTab === 'basic' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* 基本信息 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
                    
                    <div className="space-y-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          导出格式
                        </label>
                        <div className="space-y-3">
                          {(['csv', 'excel', 'json'] as ExportFormat[]).map((format) => (
                            <label key={format} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                              <input
                                type="radio"
                                name="format"
                                value={format}
                                checked={config.format === format}
                                onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as ExportFormat }))}
                                className="mt-1 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  {FORMAT_ICONS[format]}
                                  <span className="font-medium text-gray-900">
                                    {format === 'csv' && 'CSV 文件'}
                                    {format === 'excel' && 'Excel 文件 (XLSX)'}
                                    {format === 'json' && 'JSON 文件'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {FORMAT_DESCRIPTIONS[format]}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 高级选项 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">高级选项</h3>
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {showAdvanced ? '隐藏' : '显示'}
                      </button>
                    </div>

                    {showAdvanced && (
                      <div className="space-y-4">
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
              )}

              {/* 字段配置Tab */}
              {activeTab === 'fields' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">字段配置</h3>
                    <div className="text-sm text-gray-500">
                      已启用 {config.fields.filter(f => f.enabled).length} / {config.fields.length} 个字段
                    </div>
                  </div>

                  {/* 字段列表 */}
                  <div className="space-y-3">
                    {config.fields.map((field, index) => renderFieldItem(field, index))}
                  </div>
                </div>
              )}

              {/* 分组配置Tab */}
              {activeTab === 'grouping' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Group className="w-5 h-5 text-blue-600" />
                      分组配置
                    </h3>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.grouping?.enabled || false}
                        onChange={(e) => toggleGrouping(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">启用分组</span>
                    </label>
                  </div>

                  {config.grouping?.enabled && (
                    <div className="space-y-6">
                      {/* 分组字段列表 */}
                      {config.grouping.fields.length > 0 && (
                        <div className="space-y-4">
                          <div className="text-sm font-medium text-gray-700">
                            分组字段 ({config.grouping.fields.length})
                          </div>
                          <div className="space-y-3">
                            {config.grouping.fields.map((groupField, index) => 
                              renderGroupingField(groupField, index)
                            )}
                          </div>
                        </div>
                      )}

                      {/* 添加分组字段 */}
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-gray-700">添加分组字段</div>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              addGroupingField(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">选择要分组的字段...</option>
                          {config.fields
                            .filter(field => field.enabled && !config.grouping?.fields.some(gf => gf.key === field.key))
                            .map(field => (
                              <option key={field.key} value={field.key}>
                                {field.label} ({field.key})
                              </option>
                            ))
                          }
                        </select>
                      </div>

                      {/* 分组选项 */}
                      <div className="space-y-4">
                        <div className="text-sm font-medium text-gray-700">分组选项</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              空值处理
                            </label>
                            <select
                              value={config.grouping.nullValueHandling}
                              onChange={(e) => updateGroupingConfig({ nullValueHandling: e.target.value as 'skip' | 'group' | 'separate' })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              <option value="skip">跳过空值</option>
                              <option value="group">空值分组</option>
                              <option value="separate">单独显示</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              空值分组名称
                            </label>
                            <input
                              type="text"
                              value={config.grouping.nullGroupName || ''}
                              onChange={(e) => updateGroupingConfig({ nullGroupName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="未分组"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={config.grouping.preserveOrder}
                                onChange={(e) => updateGroupingConfig({ preserveOrder: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">保持原始顺序</span>
                            </label>
                          </div>
                        </div>

                        {/* 分组提示 */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <GitMerge className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                              <div className="font-medium mb-1">分组功能说明</div>
                              <ul className="text-xs space-y-1 text-blue-700">
                                <li>• <strong>合并模式</strong>：同组数据的分组字段合并显示，Excel支持单元格合并</li>
                                <li>• <strong>分离模式</strong>：每个分组独立显示，可添加分组头</li>
                                <li>• <strong>Excel格式</strong>：推荐使用Excel格式以获得最佳的分组效果</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 配置管理Tab */}
              {activeTab === 'manage' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-600" />
                      配置管理
                    </h3>
                    <button
                      onClick={loadSavedConfigs}
                      disabled={loadingConfigs}
                      className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      {loadingConfigs ? '加载中...' : '刷新'}
                    </button>
                  </div>

                  {loadingConfigs ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : savedConfigs.length === 0 ? (
                    <div className="text-center py-12">
                      <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">暂无已保存的配置</p>
                      <p className="text-sm text-gray-400">创建并保存配置后，可以在这里管理</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedConfigs.map((savedConfig) => (
                        <div
                          key={savedConfig.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {savedConfig.name}
                                </h4>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {savedConfig.format}
                                </span>
                              </div>
                              
                              {savedConfig.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {savedConfig.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>字段数: {savedConfig.fields.length}</span>
                                {savedConfig.grouping?.enabled && (
                                  <span className="flex items-center gap-1">
                                    <Group className="w-3 h-3" />
                                    分组: {savedConfig.grouping.fields?.length || 0}个
                                  </span>
                                )}
                                <span>创建时间: {savedConfig.createdAt ? new Date(savedConfig.createdAt).toLocaleDateString() : '未知'}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => loadConfigToEditor(savedConfig)}
                                className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                title="编辑此配置"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => deleteConfig(savedConfig.id)}
                                disabled={deletingConfigId === savedConfig.id}
                                className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                title="删除此配置"
                              >
                                {deletingConfigId === savedConfig.id ? '删除中...' : '删除'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {activeTab === 'manage' ? '关闭' : '取消'}
          </button>
          {activeTab !== 'manage' && (
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存配置
            </button>
          )}
        </div>
      </div>
    </div>
  );
};