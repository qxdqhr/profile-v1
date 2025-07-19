/**
 * 简化配置管理组件
 * 
 * 显示所有配置项的列表，每个配置项都可以直接编辑
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Save, Edit, Eye, EyeOff, CheckCircle, AlertTriangle, Loader, RefreshCw, Database, Server } from 'lucide-react';

interface ConfigItem {
  id: string;
  key: string;
  displayName: string;
  description: string;
  value: string;
  defaultValue: string;
  type: 'string' | 'number' | 'boolean' | 'password';
  isRequired: boolean;
  isSensitive: boolean;
  validation: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type Environment = 'development' | 'production';

export const SimpleConfigManager: React.FC = () => {
  const [configItems, setConfigItems] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({});
  const [showSensitive, setShowSensitive] = useState<{ [key: string]: boolean }>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment>('development');

  // 加载配置项
  const loadConfigItems = async (environment?: Environment) => {
    const env = environment || currentEnvironment;
    setLoading(true);
    try {
      const response = await fetch(`/api/configManager/items?environment=${env}`);
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        setConfigItems(data.items);
      } else {
        console.error('API响应格式错误:', data);
        setMessage({
          type: 'error',
          text: '加载配置项失败：响应格式错误'
        });
      }
    } catch (error) {
      console.error('加载配置项失败:', error);
      setMessage({
        type: 'error',
        text: '加载配置项时发生网络错误'
      });
    } finally {
      setLoading(false);
    }
  };

  // 开始编辑
  const startEdit = (item: ConfigItem) => {
    setEditingItem(item.id);
    setEditValues({
      ...editValues,
      [item.id]: item.value
    });
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingItem(null);
    setEditValues({});
  };

  // 保存配置项
  const saveConfigItem = async (item: ConfigItem) => {
    const newValue = editValues[item.id];
    if (newValue === undefined) return;

    setSaving(item.id);
    try {
      const response = await fetch(`/api/configManager/items/${item.id}?environment=${currentEnvironment}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: newValue
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // 更新本地状态
        setConfigItems(prev => prev.map(config => 
          config.id === item.id 
            ? { ...config, value: newValue, updatedAt: new Date().toISOString() }
            : config
        ));
        
        setMessage({
          type: 'success',
          text: `${item.displayName} 保存成功`
        });
        
        setEditingItem(null);
        setEditValues({});
      } else {
        setMessage({
          type: 'error',
          text: `保存失败: ${result.error}`
        });
      }
    } catch (error) {
      console.error('保存配置项失败:', error);
      setMessage({
        type: 'error',
        text: '保存时发生网络错误'
      });
    } finally {
      setSaving(null);
    }
  };

  // 切换敏感信息显示
  const toggleSensitive = (itemId: string) => {
    setShowSensitive(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // 切换环境
  const handleEnvironmentChange = (environment: Environment) => {
    setCurrentEnvironment(environment);
    loadConfigItems(environment);
  };

  // 过滤配置项
  const filteredItems = configItems.filter(item =>
    item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 初始化
  useEffect(() => {
    loadConfigItems();
  }, []);

  // 清除消息
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-gray-900">配置管理</h2>
          <span className="text-sm text-gray-500">({configItems.length} 个配置项)</span>
        </div>
        <button
          onClick={() => loadConfigItems()}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          刷新
        </button>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* 环境切换Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleEnvironmentChange('development')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                currentEnvironment === 'development'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>测试环境</span>
            </button>
            <button
              onClick={() => handleEnvironmentChange('production')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                currentEnvironment === 'production'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>生产环境</span>
            </button>
          </nav>
        </div>
        
        {/* 环境信息 */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">当前环境：</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              currentEnvironment === 'development'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {currentEnvironment === 'development' ? '测试环境' : '生产环境'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {currentEnvironment === 'development' ? '用于开发和测试' : '用于生产部署'}
          </div>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索配置项..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 配置项列表 */}
      {loading ? (
        <div className="text-center py-8">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">加载配置项中...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 ${
                item.isRequired ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.displayName}
                    </h3>
                    {item.isRequired && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        必需
                      </span>
                    )}
                    {item.isSensitive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        敏感
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {item.description}
                  </p>
                  
                  <div className="text-xs text-gray-500">
                    <span className="font-mono">{item.key}</span>
                    {item.type !== 'string' && (
                      <span className="ml-2">类型: {item.type}</span>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex items-center space-x-2">
                  {editingItem === item.id ? (
                    <>
                      <button
                        onClick={() => saveConfigItem(item)}
                        disabled={saving === item.id}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
                      >
                        {saving === item.id ? (
                          <Loader className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-1" />
                        )}
                        保存
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        取消
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(item)}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      编辑
                    </button>
                  )}
                </div>
              </div>

              {/* 配置值显示/编辑 */}
              <div className="mt-3">
                {editingItem === item.id ? (
                  <div className="space-y-2">
                    {item.type === 'boolean' ? (
                      <select
                        value={editValues[item.id] || item.value}
                        onChange={(e) => setEditValues({
                          ...editValues,
                          [item.id]: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : item.type === 'number' ? (
                      <input
                        type="number"
                        value={editValues[item.id] || item.value}
                        onChange={(e) => setEditValues({
                          ...editValues,
                          [item.id]: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type={item.isSensitive && !showSensitive[item.id] ? 'password' : 'text'}
                        value={editValues[item.id] || item.value}
                        onChange={(e) => setEditValues({
                          ...editValues,
                          [item.id]: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                    
                    {item.isSensitive && (
                      <button
                        onClick={() => toggleSensitive(item.id)}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
                      >
                        {showSensitive[item.id] ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            隐藏
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            显示
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900 font-mono">
                      {item.isSensitive && !showSensitive[item.id] 
                        ? '••••••••' 
                        : item.value || '(空)'
                      }
                    </span>
                    {item.isSensitive && (
                      <button
                        onClick={() => toggleSensitive(item.id)}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
                      >
                        {showSensitive[item.id] ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            隐藏
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            显示
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? '没有找到匹配的配置项' : '暂无配置项'}
        </div>
      )}
    </div>
  );
}; 