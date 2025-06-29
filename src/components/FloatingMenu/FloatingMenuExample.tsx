'use client';

import React, { useState, useEffect } from 'react';
import { FloatingMenu } from './index';

const FloatingMenuExample: React.FC = () => {
  // 添加状态来存储窗口宽度
  const [windowWidth, setWindowWidth] = useState(0);
  
  // 在客户端挂载后获取窗口宽度
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 示例菜单项
  const menuItems = [
    { id: 1, label: '首页', icon: '🏠' },
    { id: 2, label: '设置', icon: '⚙️' },
    { id: 3, label: '消息', icon: '📩' },
    { id: 4, label: '帮助', icon: '❓' },
    { id: 5, label: '退出', icon: '🚪' },
  ];
  
  // 处理菜单项点击
  const handleMenuItemClick = (id: number) => {
    console.log(`点击了菜单项: ${id}`);
    // 这里可以添加具体的处理逻辑
  };
  
  return (
    <div className="w-full h-screen bg-gray-100 relative">
      <h1 className="text-2xl font-bold p-4">悬浮菜单示例</h1>
      <p className="px-4">
        尝试拖动悬浮按钮，观察菜单的弹出方向如何根据位置变化。
        当悬浮窗在屏幕左侧时，菜单会向右弹出；在右侧时，菜单会向左弹出。
      </p>
      
      {/* 悬浮菜单组件 */}
      <FloatingMenu
        trigger={<span className="text-xl">➕</span>}
        menu={
          <div className="py-2">
            <h3 className="font-semibold mb-2 border-b pb-2">快捷菜单</h3>
            <ul>
              {menuItems.map(item => (
                <li 
                  key={item.id} 
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        }
        initialPosition={{ x: 100, y: 100 }}
      />
      
      {/* 另一个悬浮菜单实例，位于屏幕右侧 */}
      {windowWidth > 0 && (
        <FloatingMenu
          trigger={<span className="text-xl">🔍</span>}
          menu={
            <div className="py-2">
              <h3 className="font-semibold mb-2">搜索选项</h3>
              <div className="mb-2">
                <input 
                  type="text" 
                  placeholder="搜索..." 
                  className="w-full p-2 border rounded"
                />
              </div>
              <button className="w-full bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">
                搜索
              </button>
            </div>
          }
          initialPosition={{ x: windowWidth - 100, y: 100 }}
        />
      )}
    </div>
  );
};

export default FloatingMenuExample; 