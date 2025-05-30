'use client';

import React, { useState } from 'react';
import { X, Phone, Lock } from 'lucide-react';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 重置状态
  const resetState = () => {
    setPhone('');
    setPassword('');
    setLoading(false);
    setError('');
  };

  // 关闭模态框
  const handleClose = () => {
    resetState();
    onClose();
  };

  // 处理登录
  const handleLogin = async () => {
    console.log('🔑 [LoginModal] 开始登录流程...', { phone, password: '***' });
    
    if (!phone.trim()) {
      setError('请输入手机号');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号格式');
      return;
    }

    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📤 [LoginModal] 发送登录请求...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      console.log('📡 [LoginModal] 登录响应状态:', response.status);
      console.log('🍪 [LoginModal] 响应头cookies:', response.headers.get('set-cookie'));

      const data = await response.json();
      console.log('📄 [LoginModal] 登录响应数据:', data);

      if (data.success) {
        console.log('✅ [LoginModal] 登录成功, 用户:', data.user);
        console.log('🎯 [LoginModal] 调用 onSuccess 回调...');
        resetState();
        onSuccess();
        onClose();
      } else {
        console.log('❌ [LoginModal] 登录失败:', data.message);
        setError(data.message || '登录失败');
      }
    } catch (err) {
      console.error('💥 [LoginModal] 登录异常:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
      console.log('🏁 [LoginModal] 登录流程结束');
    }
  };

  // 处理回车键登录
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>用户登录</h2>
          <button onClick={handleClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.loginForm}>
            <div className={styles.iconContainer}>
              <Phone size={48} className={styles.icon} />
            </div>
            <p className={styles.description}>
              请输入您的手机号和密码进行登录
            </p>
            
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <Phone size={20} className={styles.inputIcon} />
                <input
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={styles.input}
                  maxLength={11}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <Lock size={20} className={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={styles.input}
                />
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}
            
            <button
              onClick={handleLogin}
              disabled={loading}
              className={styles.primaryButton}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 