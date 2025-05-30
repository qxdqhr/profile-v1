'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function DebugPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [cookies, setCookies] = useState<string>('');
  const [apiValidation, setApiValidation] = useState<any>(null);

  useEffect(() => {
    // 获取客户端cookies
    setCookies(document.cookie);
    
    // 手动调用API验证
    fetch('/api/auth/validate')
      .then(res => res.json())
      .then(data => setApiValidation(data))
      .catch(err => setApiValidation({ error: err.message }));
  }, []);

  const testLogin = async () => {
    console.log('🧪 [Debug] 测试登录...');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: '13800138000', 
          password: 'admin123456' 
        }),
      });
      
      const data = await response.json();
      console.log('🧪 [Debug] 测试登录结果:', data);
      
      // 重新检查状态
      window.location.reload();
    } catch (error) {
      console.error('🧪 [Debug] 测试登录失败:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 认证状态调试页面</h1>
      
      <div style={{ margin: '20px 0' }}>
        <h2>📊 当前状态</h2>
        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          <p><strong>Loading:</strong> {loading.toString()}</p>
          <p><strong>IsAuthenticated:</strong> {isAuthenticated.toString()}</p>
          <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
        </div>
      </div>

      <div style={{ margin: '20px 0' }}>
        <h2>🍪 客户端Cookies</h2>
        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', wordBreak: 'break-all' }}>
          {cookies || '无cookies'}
        </div>
      </div>

      <div style={{ margin: '20px 0' }}>
        <h2>🔍 API验证结果</h2>
        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          <pre>{JSON.stringify(apiValidation, null, 2)}</pre>
        </div>
      </div>

      <div style={{ margin: '20px 0' }}>
        <h2>🧪 测试功能</h2>
        <button 
          onClick={testLogin}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          测试登录
        </button>
      </div>

      <div style={{ margin: '20px 0' }}>
        <h2>📝 说明</h2>
        <ul>
          <li>检查浏览器开发者工具的Console日志</li>
          <li>检查Network标签页中的请求和响应</li>
          <li>检查Application标签页中的Cookies</li>
          <li>如果curl能登录成功但浏览器不行，可能是cookie设置问题</li>
        </ul>
      </div>
    </div>
  );
} 