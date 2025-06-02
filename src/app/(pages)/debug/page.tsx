'use client';

import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/modules/auth';

function DebugPageContent() {
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
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>🧪 认证调试页面</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>认证状态</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem' }}>
          {JSON.stringify({
            isAuthenticated,
            loading,
            user: user ? {
              id: user.id,
              phone: user.phone,
              name: user.name,
              role: user.role
            } : null
          }, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>客户端 Cookies</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem' }}>
          {cookies || '无 cookies'}
        </pre>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>API 验证结果</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem' }}>
          {JSON.stringify(apiValidation, null, 2)}
        </pre>
      </div>

      <div>
        <h2>测试操作</h2>
        <button 
          onClick={testLogin}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          测试登录 (管理员账号)
        </button>
      </div>
    </div>
  );
}

export default function DebugPage() {
  return (
    <AuthProvider>
      <DebugPageContent />
    </AuthProvider>
  );
} 