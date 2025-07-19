/**
 * 环境变量管理组件
 * 
 * 提供环境变量的加载、刷新、验证等功能
 */

'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, Loader, Settings } from 'lucide-react';

interface EnvConfigStats {
  total: number;
  active: number;
  required: number;
  sensitive: number;
  categories: { [key: string]: number };
}

interface EnvValidation {
  valid: boolean;
  missing: string[];
}

export const EnvConfigManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<EnvConfigStats | null>(null);
  const [validation, setValidation] = useState<EnvValidation | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 加载统计信息
  const loadStats = async () => {
    try {
      const response = await fetch('/api/configManager/env?action=stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('加载统计信息失败:', error);
    }
  };

  // 验证配置
  const validateConfig = async () => {
    try {
      const response = await fetch('/api/configManager/env?action=validate');
      const result = await response.json();
      
      if (result.success) {
        setValidation(result.data);
      }
    } catch (error) {
      console.error('验证配置失败:', error);
    }
  };

  // 加载环境变量
  const loadEnvironmentVariables = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/configManager/env?action=refresh');
      const result = await response.json();
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: `环境变量加载成功！共加载 ${result.data.totalLoaded} 个配置项`
        });
        setLastRefresh(new Date());
        await loadStats();
        await validateConfig();
      } else {
        setMessage({
          type: 'error',
          text: `加载失败: ${result.error}`
        });
      }
    } catch (error) {
      console.error('加载环境变量失败:', error);
      setMessage({
        type: 'error',
        text: '加载环境变量时发生网络错误'
      });
    } finally {
      setLoading(false);
    }
  };

  // 刷新缓存
  const refreshCache = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/configManager/env?action=refresh');
      const result = await response.json();
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: '缓存刷新成功！'
        });
        setLastRefresh(new Date());
        await loadStats();
        await validateConfig();
      } else {
        setMessage({
          type: 'error',
          text: `刷新失败: ${result.error}`
        });
      }
    } catch (error) {
      console.error('刷新缓存失败:', error);
      setMessage({
        type: 'error',
        text: '刷新缓存时发生网络错误'
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    loadStats();
    validateConfig();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">环境变量管理</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadEnvironmentVariables}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            加载环境变量
          </button>
          <button
            onClick={refreshCache}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            刷新缓存
          </button>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 统计信息 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">配置统计</h3>
          {stats ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">总配置项:</span>
                <span className="font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">激活配置:</span>
                <span className="font-medium text-green-600">{stats.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">必需配置:</span>
                <span className="font-medium text-blue-600">{stats.required}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">敏感配置:</span>
                <span className="font-medium text-orange-600">{stats.sensitive}</span>
              </div>
              
              {/* 分类统计 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">按分类统计:</h4>
                <div className="space-y-1">
                  {Object.entries(stats.categories).map(([category, count]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{category}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">加载中...</div>
          )}
        </div>

        {/* 配置验证 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">配置验证</h3>
          {validation ? (
            <div className="space-y-3">
              <div className="flex items-center">
                {validation.valid ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span className={`font-medium ${
                  validation.valid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {validation.valid ? '配置完整' : '配置不完整'}
                </span>
              </div>
              
              {!validation.valid && validation.missing.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">缺失的必需配置项:</p>
                  <ul className="text-sm text-red-600 space-y-1">
                    {validation.missing.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">加载中...</div>
          )}
        </div>
      </div>

      {/* 最后刷新时间 */}
      {lastRefresh && (
        <div className="mt-4 text-sm text-gray-500">
          最后刷新时间: {lastRefresh.toLocaleString()}
        </div>
      )}

      {/* 说明 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">使用说明:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>加载环境变量:</strong> 从数据库读取配置并应用到当前运行环境</li>
          <li>• <strong>刷新缓存:</strong> 清除缓存并重新从数据库加载配置</li>
          <li>• <strong>配置验证:</strong> 检查所有必需的配置项是否已设置</li>
          <li>• 注意：环境变量更改仅在开发环境下生效，生产环境需要重启应用</li>
        </ul>
      </div>
    </div>
  );
}; 