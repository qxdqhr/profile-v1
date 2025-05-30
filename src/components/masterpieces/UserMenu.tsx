'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Settings, LogOut, LogIn, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@/components/auth/LoginModal';
import styles from './UserMenu.module.css';

interface UserMenuProps {
  onConfigAccess: () => void;
}

export default function UserMenu({ onConfigAccess }: UserMenuProps) {
  const { isAuthenticated, user, logout, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 处理点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 处理登录
  const handleLogin = () => {
    setIsOpen(false);
    setShowLoginModal(true);
  };

  // 处理退出登录
  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await logout();
      // 可选：显示退出成功提示
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  // 处理配置页面访问
  const handleConfigClick = () => {
    setIsOpen(false);
    onConfigAccess();
  };

  // 登录成功后的处理
  const handleLoginSuccess = () => {
    refreshUser();
    setShowLoginModal(false);
  };

  return (
    <div className={styles.userMenuContainer} ref={menuRef}>
      {/* 菜单触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.menuButton}
        title={isAuthenticated ? `${user?.name || user?.phone}` : '用户菜单'}
      >
        {isAuthenticated ? <User size={20} /> : <Settings size={20} />}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className={styles.menuDropdown}>
          <div className={styles.menuContent}>
            {isAuthenticated ? (
              // 已登录状态的菜单
              <>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    <User size={16} />
                  </div>
                  <div className={styles.userDetails}>
                    <div className={styles.userName}>
                      {user?.name || '用户'}
                    </div>
                    <div className={styles.userPhone}>
                      {user?.phone}
                    </div>
                  </div>
                </div>
                
                <div className={styles.menuDivider} />
                
                <button
                  onClick={handleConfigClick}
                  className={styles.menuItem}
                >
                  <Settings size={16} />
                  <span>配置管理</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className={`${styles.menuItem} ${styles.logoutItem}`}
                >
                  <LogOut size={16} />
                  <span>退出登录</span>
                </button>
              </>
            ) : (
              // 未登录状态的菜单
              <button
                onClick={handleLogin}
                className={styles.menuItem}
              >
                <LogIn size={16} />
                <span>登录</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 登录模态框 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
} 