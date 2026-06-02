'use client';

import React from 'react';
import { useAiApiSettings } from '../context/AiApiSettingsContext';
import AiApiConnectivityTest from './AiApiConnectivityTest';

export default function AiApiSettingsPanel() {
  const { settings, updateSettings } = useAiApiSettings();

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="ai-api-key" className="mb-2 block text-sm font-medium text-gray-700">
          API Key
        </label>
        <input
          id="ai-api-key"
          type="password"
          autoComplete="off"
          value={settings.apiKey}
          onChange={(e) => updateSettings({ apiKey: e.target.value })}
          placeholder="sk-..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1.5 text-xs text-gray-500">
          保存在本机浏览器，用于识图等 AI 功能。若服务端已配置环境变量，未填写时将使用服务端密钥。
        </p>
      </div>

      <div>
        <label htmlFor="ai-base-url" className="mb-2 block text-sm font-medium text-gray-700">
          API Base URL
        </label>
        <input
          id="ai-base-url"
          type="url"
          value={settings.baseUrl}
          onChange={(e) => updateSettings({ baseUrl: e.target.value })}
          placeholder="https://api.openai.com/v1"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="ai-vision-model" className="mb-2 block text-sm font-medium text-gray-700">
          视觉模型
        </label>
        <input
          id="ai-vision-model"
          type="text"
          value={settings.visionModel}
          onChange={(e) => updateSettings({ visionModel: e.target.value })}
          placeholder="gpt-4o-mini"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1.5 text-xs text-gray-500">需支持图片输入的多模态模型。</p>
      </div>

      <AiApiConnectivityTest />
    </div>
  );
}
