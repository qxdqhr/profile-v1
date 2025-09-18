/**
 * 活动选择器组件
 * 
 * 提供活动切换功能，可以在不同活动间切换。
 * 支持下拉选择和快速切换。
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar, Check } from 'lucide-react';

export interface Event {
  id: number;
  name: string;
  slug: string;
  displayName: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface EventSelectorProps {
  /** 当前选中的活动 */
  currentEvent?: Event | null;
  /** 可选择的活动列表 */
  events: Event[];
  /** 活动切换回调 */
  onEventChange: (event: Event) => void;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 显示模式：'dropdown' | 'tabs' */
  mode?: 'dropdown' | 'tabs';
}

/**
 * 获取活动状态的显示样式
 */
function getStatusDisplay(status: Event['status']) {
  switch (status) {
    case 'active':
      return {
        text: '进行中',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        dotColor: 'bg-green-500'
      };
    case 'draft':
      return {
        text: '草稿',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        dotColor: 'bg-yellow-500'
      };
    case 'archived':
      return {
        text: '已结束',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        dotColor: 'bg-gray-500'
      };
    default:
      return {
        text: status,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        dotColor: 'bg-gray-500'
      };
  }
}

export function EventSelector({
  currentEvent,
  events,
  onEventChange,
  loading = false,
  disabled = false,
  className = '',
  mode = 'dropdown'
}: EventSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 如果是标签模式，渲染标签页
  if (mode === 'tabs') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {events.map((event) => {
          const isSelected = currentEvent?.id === event.id;
          const statusDisplay = getStatusDisplay(event.status);
          
          return (
            <button
              key={event.id}
              onClick={() => !disabled && onEventChange(event)}
              disabled={disabled || loading}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                ${isSelected 
                  ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                flex items-center gap-2
              `}
            >
              <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : statusDisplay.dotColor}`} />
              <span>{event.displayName}</span>
              {event.isDefault && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${isSelected ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  默认
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // 下拉模式
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={`
          w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm
          flex items-center justify-between gap-3
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' : ''}
        `}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Calendar size={20} className="text-gray-400 flex-shrink-0" />
          
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-gray-500">加载中...</span>
            </div>
          ) : currentEvent ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDisplay(currentEvent.status).dotColor}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{currentEvent.displayName}</div>
                <div className="text-sm text-gray-500 truncate">{currentEvent.description || currentEvent.name}</div>
              </div>
              {currentEvent.isDefault && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded flex-shrink-0">
                  默认
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-500">选择活动</span>
          )}
        </div>
        
        <ChevronDown 
          size={20} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* 下拉菜单 */}
      {isOpen && !disabled && (
        <>
          {/* 遮罩层 */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 下拉选项 */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-auto">
            {events.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500">
                暂无可用活动
              </div>
            ) : (
              events.map((event) => {
                const isSelected = currentEvent?.id === event.id;
                const statusDisplay = getStatusDisplay(event.status);
                
                return (
                  <button
                    key={event.id}
                    onClick={() => {
                      onEventChange(event);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 text-left transition-colors duration-150
                      ${isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : 'hover:bg-gray-50'}
                      border-b border-gray-100 last:border-b-0
                      flex items-center gap-3
                    `}
                  >
                    <div className={`w-2 h-2 rounded-full ${statusDisplay.dotColor}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {event.displayName}
                        </span>
                        {event.isDefault && (
                          <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded">
                            默认
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                          {statusDisplay.text}
                        </span>
                      </div>
                      
                      {event.description && (
                        <div className="text-sm text-gray-500 mt-1 truncate">
                          {event.description}
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <Check size={16} className="text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
