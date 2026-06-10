'use client';

/**
 * 测测你是什么 - 示例页面
 * Test Yourself Game - Example Page
 * 
 * 支持通过 query 参数加载不同配置：
 * - /test-yourself - 使用默认配置
 * - /test-yourself?configId=xxx - 使用指定配置
 */

import { TestYourself } from 'sa2kit/testYourself';
import type { TestConfig, TestResult } from 'sa2kit/testYourself';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function TestYourselfContent() {
  const searchParams = useSearchParams();
  const configId = searchParams?.get('configId');

  // 默认配置（当没有指定 configId 时使用）
  const defaultConfig: TestConfig = {
    gameTitle: '测测你是什么',
    gameDescription: '✨ 长按发现专属结果',
    buttonText: '按住',
    longPressDuration: 2000,
    enableIPFetch: false,
    results: [], // 使用内置的 DEFAULT_RESULTS
  };

  const handleResult = (result: TestResult) => {
    console.log('✅ 测试结果:', result);
  };

  return (
    <div>
      {/* 如果有 configId，使用配置加载；否则使用默认配置 */}
      <TestYourself 
        configId={configId || undefined}
        config={!configId ? defaultConfig : undefined}
        onResult={handleResult}
      />
      
      {/* 调试信息（开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg max-w-xs">
          <p className="font-semibold mb-1">调试信息</p>
          <p>ConfigID: {configId || '(使用默认配置)'}</p>
          <p className="mt-2 text-gray-300">
            访问 /test-yourself-admin 管理配置
          </p>
        </div>
      )}
    </div>
  );
}

export default function TestYourselfPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">加载中...</div>}>
      <TestYourselfContent />
    </Suspense>
  );
}


