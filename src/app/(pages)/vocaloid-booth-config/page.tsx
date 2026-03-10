'use client';

import { useEffect, useState } from 'react';
import { BoothConfigPage, type VocaloidBoothConfig } from 'sa2kit/vocaloidBooth/web';

const STORAGE_KEY = 'vocaloid-booth-config';

export default function VocaloidBoothConfigRoutePage() {
  const [initialConfig, setInitialConfig] = useState<Partial<VocaloidBoothConfig> | undefined>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setInitialConfig(JSON.parse(raw));
      }
    } catch {
      // ignore invalid local data
    }
  }, []);

  const handleSave = async (config: VocaloidBoothConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    alert('配置已保存到 localStorage（key: vocaloid-booth-config）');
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Vocaloid Booth 配置入口</h1>
      <div className="text-sm text-gray-600">路由：/vocaloid-booth-config</div>
      <BoothConfigPage initialConfig={initialConfig} onSave={handleSave} />
    </main>
  );
}
