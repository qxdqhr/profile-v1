'use client';

import React, { useState, useEffect } from 'react';
import { X, Phone, Shield } from 'lucide-react';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 重置状态
  const resetState = () => {
    setPhone('');
    setCode('');
    setStep('phone');
    setLoading(false);
    setCountdown(0);
    setError('');
  };

  // 关闭模态框
  const handleClose = () => {
    resetState();
    onClose();
  };

  // 发送验证码
  const sendCode = async () => {
    if (!phone.trim()) {
      setError('请输入手机号');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号格式');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, type: 'login' }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('code');
        setCountdown(60);
        // 开发环境下显示验证码
        if (data.code) {
          console.log('验证码:', data.code);
        }
      } else {
        setError(data.message || '发送验证码失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 验证登录
  const verifyLogin = async () => {
    if (!code.trim()) {
      setError('请输入验证码');
      return;
    }

    if (code.length !== 6) {
      setError('验证码应为6位数字');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();

      if (data.success) {
        resetState();
        onSuccess();
        onClose();
      } else {
        setError(data.message || '登录失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 返回上一步
  const goBack = () => {
    setStep('phone');
    setCode('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {step === 'phone' ? '手机号登录' : '输入验证码'}
          </h2>
          <button onClick={handleClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {step === 'phone' ? (
            <div className={styles.phoneStep}>
              <div className={styles.iconContainer}>
                <Phone size={48} className={styles.icon} />
              </div>
              <p className={styles.description}>
                请输入您的手机号，我们将发送验证码到您的手机
              </p>
              <div className={styles.inputGroup}>
                <input
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.input}
                  maxLength={11}
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button
                onClick={sendCode}
                disabled={loading}
                className={styles.primaryButton}
              >
                {loading ? '发送中...' : '获取验证码'}
              </button>
            </div>
          ) : (
            <div className={styles.codeStep}>
              <div className={styles.iconContainer}>
                <Shield size={48} className={styles.icon} />
              </div>
              <p className={styles.description}>
                验证码已发送至 {phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
              </p>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="请输入6位验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className={styles.input}
                  maxLength={6}
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button
                onClick={verifyLogin}
                disabled={loading}
                className={styles.primaryButton}
              >
                {loading ? '验证中...' : '登录'}
              </button>
              <div className={styles.actions}>
                <button onClick={goBack} className={styles.secondaryButton}>
                  返回修改手机号
                </button>
                <button
                  onClick={sendCode}
                  disabled={countdown > 0 || loading}
                  className={styles.secondaryButton}
                >
                  {countdown > 0 ? `重新发送(${countdown}s)` : '重新发送'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 