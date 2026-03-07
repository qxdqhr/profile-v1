'use client';

/**
 * SA2Kit 基础使用示例
 * Basic Usage Example
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { useLocalStorage } from 'sa2kit/storage';

export default function BasicUsagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-8">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            基础使用示例
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            探索 SA2Kit 的核心功能和 React Hooks
          </p>
        </div>

        {/* 示例内容 */}
        <div className="space-y-8">
          {/* Storage Hook 示例 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Storage Hook 示例</h2>
            <ThemeToggle />
          </div>

          {/* Counter 示例 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">持久化计数器</h2>
            <PersistentCounter />
          </div>

          {/* 用户偏好设置 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">用户偏好设置</h2>
            <UserPreferences />
          </div>

          {/* 代码示例 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">代码示例</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`import { useLocalStorage } from 'sa2kit/storage';

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  );
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 主题切换组件
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('example-theme', 'light');

  return (
    <div className={clsx(
      'p-6 rounded-lg transition-colors',
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    )}>
      <h3 className="text-xl font-semibold mb-4">当前主题: {theme}</h3>
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
      >
        切换到 {theme === 'light' ? 'Dark' : 'Light'} 模式
      </button>
      <p className="mt-4 text-sm opacity-75">
        主题偏好会自动保存到 localStorage
      </p>
    </div>
  );
}

// 持久化计数器
function PersistentCounter() {
  const [count, setCount] = useLocalStorage('example-counter', 0);

  return (
    <div className="space-y-4">
      <div className="text-6xl font-bold text-center text-blue-600 dark:text-blue-400">
        {count}
      </div>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setCount(count - 1)}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
        >
          - 减少
        </button>
        <button
          onClick={() => setCount(0)}
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          重置
        </button>
        <button
          onClick={() => setCount(count + 1)}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
        >
          + 增加
        </button>
      </div>
      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        计数会自动保存，刷新页面不会丢失
      </p>
    </div>
  );
}

// 用户偏好设置
function UserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('user-preferences', {
    notifications: true,
    soundEffects: false,
    language: 'zh-CN',
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div>
          <h4 className="font-medium">通知</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">接收应用通知</p>
        </div>
        <button
          onClick={() => togglePreference('notifications')}
          className={clsx(
            'w-12 h-6 rounded-full transition-colors',
            preferences.notifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <div className={clsx(
            'w-4 h-4 rounded-full bg-white transition-transform',
            preferences.notifications ? 'translate-x-7' : 'translate-x-1'
          )} />
        </button>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div>
          <h4 className="font-medium">音效</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">启用音效反馈</p>
        </div>
        <button
          onClick={() => togglePreference('soundEffects')}
          className={clsx(
            'w-12 h-6 rounded-full transition-colors',
            preferences.soundEffects ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <div className={clsx(
            'w-4 h-4 rounded-full bg-white transition-transform',
            preferences.soundEffects ? 'translate-x-7' : 'translate-x-1'
          )} />
        </button>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="font-medium mb-2">语言</h4>
        <select
          value={preferences.language}
          onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="zh-CN">简体中文</option>
          <option value="en-US">English</option>
          <option value="ja-JP">日本語</option>
        </select>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          💡 所有设置都会自动保存到浏览器本地存储
        </p>
      </div>
    </div>
  );
}











