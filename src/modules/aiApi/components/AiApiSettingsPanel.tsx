'use client';

import React, { useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAiApiSettings } from '../context/AiApiSettingsContext';
import { useAiModels } from '../hooks/useAiModels';
import AiApiConnectivityTest from './AiApiConnectivityTest';

export default function AiApiSettingsPanel() {
  const { settings, updateSettings } = useAiApiSettings();

  const handleSuggestedModel = useCallback(
    (model: string) => {
      updateSettings({ visionModel: model });
    },
    [updateSettings]
  );

  const { visionModels, allModels, loading, error, refresh } = useAiModels(
    settings,
    handleSuggestedModel
  );

  const selectableModels = visionModels;
  const showDropdown = selectableModels.length > 0;
  const showAllModelsFallback = visionModels.length === 0 && allModels.length > 0;

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
        <p className="mt-1.5 text-xs text-gray-500">
          填写 Key 与地址后将自动拉取可用模型并选择合适的视觉模型。
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <label htmlFor="ai-vision-model" className="text-sm font-medium text-gray-700">
            视觉模型
          </label>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            刷新模型
          </button>
        </div>

        {showDropdown ? (
          <select
            id="ai-vision-model"
            value={settings.visionModel}
            onChange={(e) => updateSettings({ visionModel: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {selectableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
            {settings.visionModel && !selectableModels.includes(settings.visionModel) && (
              <option value={settings.visionModel}>{settings.visionModel}（当前）</option>
            )}
          </select>
        ) : (
          <input
            id="ai-vision-model"
            type="text"
            value={settings.visionModel}
            onChange={(e) => updateSettings({ visionModel: e.target.value })}
            placeholder="gpt-4o-mini"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {loading && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            正在读取可用模型…
          </p>
        )}
        {!loading && error && (
          <p className="mt-1.5 text-xs text-amber-600">
            无法自动获取模型列表：{error}。可手动填写模型名称。
          </p>
        )}
        {!loading && !error && showDropdown && (
          <p className="mt-1.5 text-xs text-gray-500">
            已加载 {selectableModels.length} 个
            {visionModels.length > 0 ? '视觉' : '对话'}模型，可手动切换。
          </p>
        )}
        {!loading && !error && showAllModelsFallback && (
          <p className="mt-1.5 text-xs text-amber-600">
            未识别到视觉模型，请手动填写支持识图的模型名（勿使用 deepseek-chat 等纯文本模型）。
          </p>
        )}
        {!loading && !error && !showDropdown && !showAllModelsFallback && (
          <p className="mt-1.5 text-xs text-gray-500">需支持图片输入的多模态模型。</p>
        )}
      </div>

      <div>
        <label htmlFor="ai-text-model" className="mb-2 block text-sm font-medium text-gray-700">
          文本模型
        </label>
        <input
          id="ai-text-model"
          type="text"
          value={settings.textModel ?? settings.visionModel}
          onChange={(e) => updateSettings({ textModel: e.target.value })}
          placeholder="gpt-4o-mini"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1.5 text-xs text-gray-500">纯文本与 STT 转写后的对话；默认同视觉模型。</p>
      </div>

      <div>
        <label htmlFor="ai-audio-model" className="mb-2 block text-sm font-medium text-gray-700">
          语音转写模型（STT）
        </label>
        <input
          id="ai-audio-model"
          type="text"
          value={settings.audioModel ?? 'whisper-1'}
          onChange={(e) => updateSettings({ audioModel: e.target.value })}
          placeholder="whisper-1"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1.5 text-xs text-gray-500">
          多模态 auto 模式下，不支持内嵌音频时将用此模型转写（Whisper 等）。
        </p>
      </div>

      <AiApiConnectivityTest />
    </div>
  );
}
