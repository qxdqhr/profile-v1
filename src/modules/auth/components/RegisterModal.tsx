'use client';

import React, { useState } from 'react';
import { X, User, Lock, Phone, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validatePhoneNumber, validatePassword } from '../utils/authUtils';
import styles from '../styles/LoginModal.module.css'; // 复用LoginModal的样式
import type { RegisterModalProps } from '../types';

export default function RegisterModal({ isOpen, onClose, onSuccess, onSwitchToLogin }: RegisterModalProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // 清除错误信息
  };

  const validateForm = () => {
    if (!formData.phone || !formData.password || !formData.confirmPassword) {
      setError('请填写必要信息');
      return false;
    }

    if (!validatePhoneNumber(formData.phone)) {
      setError('请输入正确的手机号格式');
      return false;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || '密码格式错误');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!validateForm()) {
        return;
      }

      console.log('📝 [RegisterModal] 提交注册表单:', { 
        phone: formData.phone, 
        name: formData.name || '未设置',
        password: '***' 
      });

      // 使用useAuth的register方法
      const result = await register({
        phone: formData.phone,
        password: formData.password,
        name: formData.name || undefined,
      });

      if (result.success) {
        console.log('✅ [RegisterModal] 注册成功');
        onSuccess();
      } else {
        console.log('❌ [RegisterModal] 注册失败:', result.message);
        setError(result.message || '注册失败');
      }
    } catch (error) {
      console.error('💥 [RegisterModal] 注册异常:', error);
      setError('注册失败，请稍后重试');
    } finally {
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
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {/* 关闭按钮 */}
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>

        {/* 标题 */}
        <div className={styles.header}>
          <h2>用户注册</h2>
          <p>请填写以下信息创建账户</p>
        </div>

        {/* 注册表单 */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 手机号输入 */}
          <div className={styles.inputGroup}>
            <label htmlFor="phone">手机号 *</label>
            <div className={styles.inputWrapper}>
              <Phone size={18} className={styles.inputIcon} />
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

          {/* 姓名输入（可选） */}
          <div className={styles.inputGroup}>
            <label htmlFor="name">姓名</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="请输入姓名（可选）"
                className={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          {/* 密码输入 */}
          <div className={styles.inputGroup}>
            <label htmlFor="password">密码 *</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="请输入密码（至少6位）"
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

          {/* 确认密码输入 */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">确认密码 *</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="请再次输入密码"
                className={styles.input}
                disabled={loading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
            {loading ? '注册中...' : '注册'}
          </button>

          {/* 登录链接 */}
          {onSwitchToLogin && (
            <div className={styles.switchLink}>
              <span>已有账号？</span>
              <button type="button" onClick={onSwitchToLogin} className={styles.linkButton}>
                立即登录
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 