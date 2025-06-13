'use client';

import React, { useState } from 'react';
import { X, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { validatePhoneNumber, validatePassword } from '../utils/authUtils';
import styles from '../styles/LoginModal.module.css';
import type { ForgotPasswordModalProps } from '../types';

export default function ForgotPasswordModal({ isOpen, onClose, onSuccess }: ForgotPasswordModalProps) {
  const [formData, setFormData] = useState({
    phone: '',
    newPassword: '',
    confirmPassword: '',
    verificationCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // 清除错误信息
  };

  const validateForm = () => {
    if (!formData.phone || !formData.newPassword || !formData.confirmPassword || !formData.verificationCode) {
      setError('请填写完整信息');
      return false;
    }

    if (!validatePhoneNumber(formData.phone)) {
      setError('请输入正确的手机号格式');
      return false;
    }

    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || '密码格式错误');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }

    if (!/^\d{6}$/.test(formData.verificationCode)) {
      setError('请输入6位数字验证码');
      return false;
    }

    return true;
  };

  const handleSendCode = async () => {
    if (!formData.phone) {
      setError('请输入手机号');
      return;
    }

    if (!validatePhoneNumber(formData.phone)) {
      setError('请输入正确的手机号格式');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const data = await response.json();
      if (data.success) {
        // 开始倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || '发送验证码失败');
      }
    } catch (error) {
      setError('发送验证码失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!validateForm()) {
        return;
      }

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          newPassword: formData.newPassword,
          verificationCode: formData.verificationCode,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || '重置密码失败');
      }
    } catch (error) {
      setError('重置密码失败，请稍后重试');
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
          <h2>重置密码</h2>
          <p>请输入手机号和验证码重置密码</p>
        </div>

        {/* 重置密码表单 */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 手机号输入 */}
          <div className={styles.inputGroup}>
            <label htmlFor="phone">手机号</label>
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

          {/* 验证码输入 */}
          <div className={styles.inputGroup}>
            <label htmlFor="verificationCode">验证码</label>
            <div className={styles.inputWrapper}>
              <input
                id="verificationCode"
                name="verificationCode"
                type="text"
                value={formData.verificationCode}
                onChange={handleInputChange}
                placeholder="请输入验证码"
                className={styles.input}
                disabled={loading}
                maxLength={6}
              />
              <button
                type="button"
                className={styles.sendCodeButton}
                onClick={handleSendCode}
                disabled={loading || countdown > 0}
              >
                {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
              </button>
            </div>
          </div>

          {/* 新密码输入 */}
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword">新密码</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="请输入新密码"
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
            <label htmlFor="confirmPassword">确认密码</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="请再次输入新密码"
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
            {loading ? '提交中...' : '重置密码'}
          </button>
        </form>
      </div>
    </div>
  );
} 