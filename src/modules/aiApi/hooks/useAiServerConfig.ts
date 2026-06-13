'use client';

import { useEffect, useState } from 'react';
import type { AiServerConfigStatus } from '../api/config/route';

export function useAiServerConfig() {
  const [config, setConfig] = useState<AiServerConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch('/api/ai/config', { credentials: 'include' });
        if (!response.ok) {
          if (!cancelled) {
            setConfig({ serverConfigured: false });
            setError(response.status === 401 ? '请先登录' : '无法读取服务端配置');
          }
          return;
        }
        const data = (await response.json()) as AiServerConfigStatus;
        if (!cancelled) {
          setConfig(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setConfig({ serverConfigured: false });
          setError(err instanceof Error ? err.message : '无法读取服务端配置');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { config, loading, error };
}
