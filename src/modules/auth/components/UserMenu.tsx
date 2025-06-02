'use client';

import React, { useState } from 'react';
import { LogOut, LogIn, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import styles from '../styles/UserMenu.module.css';
import type { UserMenuProps } from '../types';

export default function UserMenu({ customMenuItems = [], className }: UserMenuProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // 切换菜单显示
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // 点击菜单外部时关闭菜单
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 处理自定义菜单项点击
  const handleCustomMenuClick = (item: any) => {
    console.log(`🔧 [UserMenu] 自定义菜单项被点击: ${item.label}`);
    item.onClick();
    setIsOpen(false);
  };

  // 处理登录
  const handleLogin = () => {
    console.log('🔑 [UserMenu] 登录按钮被点击');
    setShowLoginModal(true);
    setIsOpen(false);
  };

  // 处理注册
  const handleRegister = () => {
    console.log('📝 [UserMenu] 注册按钮被点击');
    setShowRegisterModal(true);
    setIsOpen(false);
  };

  // 处理退出登录
  const handleLogout = async () => {
    console.log('🚪 [UserMenu] 退出登录按钮被点击');
    try {
      await logout();
      console.log('✅ [UserMenu] 退出登录成功');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
    setIsOpen(false);
  };

  // 登录成功后的处理
  const handleAuthSuccess = () => {
    console.log('🎉 [UserMenu] 认证成功回调被调用');
    console.log('👤 [UserMenu] 当前useAuth状态:', {
      user: user ? `${user.name || '未设置'} (${user.phone})` : null,
      isAuthenticated
    });
    
    // useAuth hook会自动更新状态，这里不需要手动处理
    setShowLoginModal(false);
    setShowRegisterModal(false);
    
    console.log('✅ [UserMenu] 认证成功处理完成 - 模态框已关闭');
    
    // 延迟检查状态
    setTimeout(() => {
      console.log('🔍 [UserMenu] 延迟状态检查:', {
        user: user ? `${user.name || '未设置'} (${user.phone})` : null,
        isAuthenticated
      });
    }, 500);
  };

  // 从登录切换到注册
  const handleSwitchToRegister = () => {
    console.log('🔄 [UserMenu] 从登录切换到注册');
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  // 从注册切换到登录
  const handleSwitchToLogin = () => {
    console.log('🔄 [UserMenu] 从注册切换到登录');
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  // 过滤自定义菜单项：根据登录状态和requireAuth属性
  const getVisibleCustomMenuItems = () => {
    return customMenuItems.filter(item => {
      // 如果设置了requireAuth为true，只有登录后才显示
      if (item.requireAuth === true) {
        return isAuthenticated;
      }
      // 如果设置了requireAuth为false，只有未登录才显示
      if (item.requireAuth === false) {
        return !isAuthenticated;
      }
      // 如果没有设置requireAuth，总是显示
      return true;
    });
  };

  // 全局点击处理（关闭菜单）
  React.useEffect(() => {
    const handleGlobalClick = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('click', handleGlobalClick);
    }

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [isOpen]);

  const visibleCustomMenuItems = getVisibleCustomMenuItems();

  return (
    <div className={`${styles.userMenu} ${className || ''}`}>
      {/* 用户头像/图标 */}
      <button className={styles.userButton} onClick={toggleMenu}>
        <User size={24} />
        {isAuthenticated && user && (
          <span className={styles.userName}>
            {user.name || user.phone}
          </span>
        )}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className={styles.dropdownMenu} onClick={handleMenuClick}>
          {isAuthenticated && user ? (
            // 已登录状态的菜单
            <>
              <div className={styles.userInfo}>
                <div className={styles.userInfoName}>
                  {user.name || '未设置名称'}
                </div>
                <div className={styles.userInfoPhone}>
                  {user.phone}
                </div>
                <div className={styles.userInfoRole}>
                  {user.role === 'admin' ? '管理员' : '普通用户'}
                </div>
              </div>
              
              {/* 自定义菜单项 */}
              {visibleCustomMenuItems.length > 0 && (
                <>
                  <div className={styles.menuDivider}></div>
                  {visibleCustomMenuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button 
                        key={item.id}
                        className={styles.menuItem} 
                        onClick={() => handleCustomMenuClick(item)}
                      >
                        {IconComponent && <IconComponent size={16} />}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </>
              )}
              
              <div className={styles.menuDivider}></div>
              
              <button className={styles.menuItem} onClick={handleLogout}>
                <LogOut size={16} />
                <span>退出登录</span>
              </button>
            </>
          ) : (
            // 未登录状态的菜单
            <>
              <button className={styles.menuItem} onClick={handleLogin}>
                <LogIn size={16} />
                <span>登录</span>
              </button>
              <button className={styles.menuItem} onClick={handleRegister}>
                <User size={16} />
                <span>注册</span>
              </button>
              
              {/* 未登录状态的自定义菜单项 */}
              {visibleCustomMenuItems.length > 0 && (
                <>
                  <div className={styles.menuDivider}></div>
                  {visibleCustomMenuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button 
                        key={item.id}
                        className={styles.menuItem} 
                        onClick={() => handleCustomMenuClick(item)}
                      >
                        {IconComponent && <IconComponent size={16} />}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* 登录模态框 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToRegister={handleSwitchToRegister}
      />

      {/* 注册模态框 */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
} 