'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { createAiClient } from 'sa2kit/ai/llm';
import { AiChatDialog, AiConfigPage } from 'sa2kit/ai/llm/ui/web';

type AiUiConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
  template: string;
  temperature: number;
  topP: number;
  maxTokens: number;
};

const STORAGE_KEY = 'sa2kit-ai-config';

const DEFAULT_CONFIG: AiUiConfig = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  systemPrompt: '你是一个专业且简洁的 AI 助手。',
  template: '{{input}}',
  temperature: 0.7,
  topP: 1,
  maxTokens: 1024,
};

const readConfig = (): AiUiConfig => {
  if (typeof window === 'undefined') {
    return DEFAULT_CONFIG;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_CONFIG;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AiUiConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
};

export default function AiLlmDialogPage() {
  const [config, setConfig] = useState<AiUiConfig>(() => readConfig());
  const [open, setOpen] = useState(false);
  const [lastError, setLastError] = useState<string>('');

  const client = useMemo(() => {
    return createAiClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
    });
  }, [config.apiKey, config.baseUrl, config.model]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">AI LLM 对话框示例</h1>
          <p className="mt-2 text-sm text-slate-600">
            该页面直接引用 `sa2kit/ai/llm` 与 `sa2kit/ai/llm/ui/web`，用于测试 API Key
            对话链路。
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              打开 AI 对话框
            </button>
            <Link
              href="/examples/"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              返回首页
            </Link>
          </div>
          {lastError && (
            <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
              {lastError}
            </p>
          )}
        </header>

        <AiConfigPage
          storageKey={STORAGE_KEY}
          initialConfig={config}
          onSave={(nextConfig) => {
            setConfig(nextConfig);
            setLastError('');
          }}
          onChange={(nextConfig) => {
            setConfig(nextConfig);
          }}
        />
      </div>

      <AiChatDialog
        open={open}
        onOpenChange={setOpen}
        client={client}
        title="SA2Kit AI 对话测试"
        placeholder="输入问题后按 Enter 发送，Shift+Enter 换行"
        systemPrompt={config.systemPrompt}
        template={config.template}
        requestOptions={{
          model: config.model,
          temperature: config.temperature,
          topP: config.topP,
          maxTokens: config.maxTokens,
        }}
        onError={(error) => {
          setLastError(error.message);
        }}
      />
    </main>
  );
}
