/**
 * ShowMasterpiece 模块 - 导航上下文
 *
 * 用于管理页面导航历史，解决浏览器后退按钮的问题
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface NavigationContextType {
  /** 上级页面URL */
  parentUrl: string | null;
  /** 设置上级页面URL */
  setParentUrl: (url: string | null) => void;
  /** 获取上级页面URL，如果没有则返回默认URL */
  getParentUrl: (defaultUrl?: string) => string;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

/**
 * 导航上下文提供者
 */
export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parentUrl, setParentUrl] = useState<string | null>(null);

  // 组件挂载时从sessionStorage读取上级URL
  useEffect(() => {
    const storedParentUrl = sessionStorage.getItem('showmasterpiece_parent_url');
    if (storedParentUrl) {
      setParentUrl(storedParentUrl);
    }
  }, []);

  // 当parentUrl变化时，保存到sessionStorage
  useEffect(() => {
    if (parentUrl) {
      sessionStorage.setItem('showmasterpiece_parent_url', parentUrl);
    } else {
      sessionStorage.removeItem('showmasterpiece_parent_url');
    }
  }, [parentUrl]);

  const getParentUrl = (defaultUrl = '/testField') => {
    return parentUrl || defaultUrl;
  };

  const value: NavigationContextType = {
    parentUrl,
    setParentUrl,
    getParentUrl,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * 使用导航上下文的Hook
 */
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};