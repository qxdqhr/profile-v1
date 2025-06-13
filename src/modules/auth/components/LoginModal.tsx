'use client';

import React, { useState } from 'react';
import { X, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validatePhoneNumber } from '../utils/authUtils';
import styles from '../styles/LoginModal.module.css';
import type { LoginModalProps } from '../types';
import ForgotPasswordModal from './ForgotPasswordModal';

/**
 * 登录模态框组件
 * 提供用户登录界面和逻辑
 */
export default function LoginModal({ isOpen, onClose, onSuccess, onSwitchToRegister }: LoginModalProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // 开发环境快速填充
  const fillDemoAccount = (type: 'admin' | 'user') => {
    if (process.env.NODE_ENV === 'development') {
      const accounts = {
        admin: { phone: '13800138000', password: 'admin123456' },
        user: { phone: '13900139000', password: 'test123456' }
      };
      setFormData(accounts[type]);
      setError('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // 清除错误信息
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔄 [LoginModal] handleSubmit 开始');

    try {
      // 前端验证
      if (!formData.phone || !formData.password) {
        console.log('❌ [LoginModal] 前端验证失败: 信息不完整');
        setError('请填写完整信息');
        return;
      }

      if (!validatePhoneNumber(formData.phone)) {
        console.log('❌ [LoginModal] 前端验证失败: 手机号格式错误');
        setError('请输入正确的手机号');
        return;
      }

      console.log('✅ [LoginModal] 前端验证通过');
      console.log('🔑 [LoginModal] 提交登录表单:', { 
        phone: formData.phone, 
        password: '***' 
      });

      console.log('📞 [LoginModal] 准备调用 useAuth.login()...');
      
      // 使用useAuth的login方法
      const result = await login(formData);
      
      console.log('📡 [LoginModal] useAuth.login() 返回结果:', result);

      if (result.success) {
        console.log('✅ [LoginModal] 登录成功，准备调用 onSuccess()');
        console.log('👤 [LoginModal] 登录成功的用户信息:', result.user);
        
        // 短暂延迟确保状态已更新
        setTimeout(() => {
          console.log('🎯 [LoginModal] 调用 onSuccess 回调');
          onSuccess();
          console.log('🏁 [LoginModal] onSuccess 调用完成');
        }, 100);
        
      } else {
        console.log('❌ [LoginModal] 登录失败:', result.message);
        setError(result.message || '登录失败');
      }
    } catch (error) {
      console.error('💥 [LoginModal] 登录异常:', error);
      setError('登录失败，请稍后重试');
    } finally {
      console.log('🔚 [LoginModal] handleSubmit 结束，设置 loading = false');
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={handleOverlayClick}>
        <div className={styles.modal}>
          {/* 关闭按钮 */}
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>

          {/* 标题 */}
          <div className={styles.header}>
            <h2>用户登录</h2>
            <p>请输入您的手机号和密码</p>
          </div>

          {/* 开发环境快捷登录 */}
          {process.env.NODE_ENV === 'development' && (
            <div className={styles.devTools}>
              <p>开发环境快捷登录：</p>
              <div className={styles.devButtons}>
                <button type="button" onClick={() => fillDemoAccount('admin')} className={styles.devButton}>
                  管理员账号
                </button>
                <button type="button" onClick={() => fillDemoAccount('user')} className={styles.devButton}>
                  用户账号
                </button>
              </div>
            </div>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* 手机号输入 */}
            <div className={styles.inputGroup}>
              <label htmlFor="phone">手机号</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="请输入手机号"
                  className={styles.input}
                  disabled={loading}
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div className={styles.inputGroup}>
              <label htmlFor="password">密码</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="请输入密码"
                  className={styles.input}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* 忘记密码链接 */}
            <div className={styles.forgotPassword}>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className={styles.linkButton}
              >
                忘记密码？
              </button>
            </div>

            {/* 错误信息 */}
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </button>

            {/* 注册链接 */}
            {onSwitchToRegister && (
              <div className={styles.switchLink}>
                <span>还没有账号？</span>
                <button type="button" onClick={onSwitchToRegister} className={styles.linkButton}>
                  立即注册
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* 忘记密码模态框 */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={() => {
          setShowForgotPassword(false);
          onSuccess();
        }}
      />
    </>
  );
} 