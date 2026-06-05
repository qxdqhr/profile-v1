'use client';

import { useEffect, useState } from 'react';
import type { HomePageConfig } from '../types';

export function useHomePageConfig() {
  const [config, setConfig] = useState<HomePageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/homePage');
      if (!response.ok) {
        throw new Error('Failed to fetch config');
      }
      const data = (await response.json()) as HomePageConfig;
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取配置失败');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  return { config, loading, error, reload };
}
