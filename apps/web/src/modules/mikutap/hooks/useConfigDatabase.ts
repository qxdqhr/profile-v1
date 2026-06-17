import { useState, useCallback } from 'react';
import { GridConfig } from '../types';

export function useConfigDatabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 保存配置到数据库
  const saveConfig = useCallback(async (config: GridConfig) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mikutap/configs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 从数据库加载配置
  const loadConfig = useCallback(async (configId: string = 'default') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/mikutap/configs?id=${configId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // 配置不存在
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load configuration');
      }

      const config = await response.json();
      return {
        ...config,
        createdAt: new Date(config.createdAt),
        updatedAt: new Date(config.updatedAt),
      } as GridConfig;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取所有配置列表
  const getAllConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mikutap/configs');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load configurations');
      }

      const configs = await response.json();
      return configs.map((config: any) => ({
        ...config,
        createdAt: new Date(config.createdAt),
        updatedAt: new Date(config.updatedAt),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除配置
  const deleteConfig = useCallback(async (configId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/mikutap/configs?id=${configId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete configuration');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建新配置
  const createConfig = useCallback(async (config: GridConfig) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mikutap/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create configuration');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    saveConfig,
    loadConfig,
    getAllConfigs,
    deleteConfig,
    createConfig,
  };
} 