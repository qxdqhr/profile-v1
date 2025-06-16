'use client';

import React, { useState, useCallback } from 'react';
import Navigation from './Navigation';
import NavigationToggle from './NavigationToggle';
import { NavigationProps, NavigationItem } from './types';

interface NavigationContainerProps extends Omit<NavigationProps, 'isOpen' | 'onToggle'> {
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const NavigationContainer: React.FC<NavigationContainerProps> = ({
  config,
  activeItemId,
  onItemClick,
  className,
  defaultOpen = false,
  onOpenChange
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  }, [isOpen, onOpenChange]);

  const handleItemClick = useCallback((item: NavigationItem) => {
    onItemClick?.(item);
    // 可选：点击导航项后自动关闭导航栏
    // setIsOpen(false);
  }, [onItemClick]);

  return (
    <>
      {/* 切换按钮 */}
      <NavigationToggle
        isOpen={isOpen}
        onClick={handleToggle}
        position={config.position}
      />
      
      {/* 导航栏 */}
      <Navigation
        config={config}
        isOpen={isOpen}
        onToggle={handleToggle}
        activeItemId={activeItemId}
        onItemClick={handleItemClick}
        className={className}
      />
      
      {/* 遮罩层 - 点击时关闭导航栏 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[80] transition-opacity duration-300"
          onClick={handleToggle}
        />
      )}
    </>
  );
};

// 导出类型和组件
export * from './types';
export { Navigation, NavigationToggle, NavigationContainer };
export default NavigationContainer;