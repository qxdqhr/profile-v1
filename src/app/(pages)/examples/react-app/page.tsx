'use client';

/**
 * React App 完整示例
 * Complete React App Example
 */

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from 'sa2kit/storage';
import { clsx } from 'clsx';

// 用户类型
interface User {
  id: number;
  username: string;
  email: string;
}

// 模拟验证函数
const isValidUsername = (username: string): boolean => {
  return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function ReactAppPage() {
  const [user, setUser, removeUser] = useLocalStorage<User | null>('demo-current-user', null);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('demo-app-theme', 'light');

  useEffect(() => {
    console.log('App mounted', { theme, hasUser: !!user });
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    console.log('User logged in', { userId: userData.id });
  };

  const handleLogout = () => {
    removeUser();
    console.log('User logged out');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    console.log('Theme changed', { theme: newTheme });
  };

  return (
    <div className={clsx('min-h-screen transition-colors', theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900')}>
      <div className="max-w-4xl mx-auto p-8">
        {/* 头部 */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">SA2Kit 演示应用</h1>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                完整的 React 应用示例
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              切换到 {theme === 'light' ? 'Dark' : 'Light'} 模式
            </button>
          </div>
        </header>

        {/* 主内容 */}
        <main className={clsx('rounded-xl shadow-lg p-8', theme === 'dark' ? 'bg-gray-800' : 'bg-white')}>
          {user ? (
            <UserProfile user={user} onLogout={handleLogout} theme={theme} />
          ) : (
            <LoginForm onLogin={handleLogin} theme={theme} />
          )}
        </main>

        {/* 底部 */}
        <footer className="mt-8 text-center">
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Powered by <strong className="text-blue-500">SA2Kit</strong>
          </p>
        </footer>
      </div>
    </div>
  );
}

// 登录表单组件
function LoginForm({ 
  onLogin, 
  theme 
}: { 
  onLogin: (user: User) => void; 
  theme: 'light' | 'dark';
}) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // 验证输入
    if (!isValidUsername(username)) {
      setErrors(['用户名格式无效（3-20字符，仅字母数字下划线）']);
      console.warn('Invalid username attempt', { username });
      return;
    }

    if (!isValidEmail(email)) {
      setErrors(['邮箱格式无效']);
      console.warn('Invalid email attempt', { email });
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting login', { username });
      
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: Math.floor(Math.random() * 1000),
        username,
        email,
      };

      console.log('Login successful', { userId: user.id });
      onLogin(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败';
      setErrors([message]);
      console.error('Login failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">登录</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            用户名
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="3-20字符，字母数字下划线"
            className={clsx('w-full px-4 py-3 rounded-lg border transition-colors', theme === 'dark'
                ? 'bg-gray-700 border-gray-600 focus:border-blue-500'
                : 'bg-white border-gray-300 focus:border-blue-500', 'focus:outline-none focus:ring-2 focus:ring-blue-500/20')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            邮箱
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className={clsx('w-full px-4 py-3 rounded-lg border transition-colors', theme === 'dark'
                ? 'bg-gray-700 border-gray-600 focus:border-blue-500'
                : 'bg-white border-gray-300 focus:border-blue-500', 'focus:outline-none focus:ring-2 focus:ring-blue-500/20')}
          />
        </div>

        {errors.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            {errors.map((error, i) => (
              <p key={i} className="text-red-700 dark:text-red-400 text-sm">
                {error}
              </p>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>

      <div className={clsx('mt-6 p-4 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
        <h3 className="font-medium mb-2">提示</h3>
        <ul className={clsx('text-sm space-y-1', theme === 'dark' ? 'text-gray-300' : 'text-gray-600')}>
          <li>• 用户名: 3-20字符，仅字母数字下划线</li>
          <li>• 邮箱: 有效的邮箱格式</li>
          <li>• 登录信息会保存到 localStorage</li>
        </ul>
      </div>
    </div>
  );
}

// 用户资料组件
function UserProfile({ 
  user, 
  onLogout, 
  theme 
}: { 
  user: User; 
  onLogout: () => void;
  theme: 'light' | 'dark';
}) {
  const displayName = user.username.charAt(0).toUpperCase() + user.username.slice(1);

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-4xl font-bold text-white">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <h2 className="text-3xl font-bold mb-2">
          欢迎, {displayName}!
        </h2>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          {user.email}
        </p>
      </div>

      <div className={clsx('p-6 rounded-lg mb-6', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
        <h3 className="font-medium mb-4">用户信息</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              用户 ID:
            </span>
            <span className="font-mono">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              用户名:
            </span>
            <span className="font-medium">{user.username}</span>
          </div>
          <div className="flex justify-between">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              邮箱:
            </span>
            <span>{user.email}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
      >
        退出登录
      </button>

      <p className={clsx('mt-4 text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
        💡 用户信息已保存到 localStorage
      </p>
    </div>
  );
}











