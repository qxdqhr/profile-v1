'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CompletionFilter, TestFieldConfig, ExperimentItem, SortMode } from '../types';
import { experiments as initialExperiments } from '../utils/experimentData';
import { 
  filterExperiments, 
  sortExperiments, 
  getExperimentCounts
} from '../utils';

import { SearchResultHint } from 'sa2kit/common/ui/patterns';
import {
  CompletionFilter as CompletionFilterComponent,
  PageHeader,
  ExperimentGrid,
  EmptyState,
  SortControl,
  SortModeToggle,
  TestFieldSearchBox,
  DraggableExperimentGrid,
} from '../components';
import { UserInfoBar } from '../components/UserInfoBar';

// 从本地存储中获取用户自定义排序
const getUserOrderFromStorage = (): Record<string, number> => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem('testField_userOrder');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to parse user order from localStorage:', error);
    return {};
  }
};

// 保存用户自定义排序到本地存储
const saveUserOrderToStorage = (items: ExperimentItem[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    const orderMap: Record<string, number> = {};
    items.forEach((item, index) => {
      orderMap[item.id] = index;
    });
    localStorage.setItem('testField_userOrder', JSON.stringify(orderMap));
  } catch (error) {
    console.error('Failed to save user order to localStorage:', error);
  }
};

// 主页面组件
export default function TestFieldPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>('all');
  const [sortBy, setSortBy] = useState<TestFieldConfig['sortBy']>('title');
  const [sortOrder, setSortOrder] = useState<TestFieldConfig['sortOrder']>('asc');
  const [sortMode, setSortMode] = useState<SortMode>('auto');
  const [experiments, setExperiments] = useState<ExperimentItem[]>(initialExperiments);
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // 初始化时应用用户自定义排序
  useEffect(() => {
    const userOrder = getUserOrderFromStorage();
    
    // 应用用户排序到初始数据
    const itemsWithUserOrder = initialExperiments.map(item => ({
      ...item,
      userOrder: userOrder[item.id] !== undefined ? userOrder[item.id] : Number.MAX_SAFE_INTEGER
    }));
    
    setExperiments(itemsWithUserOrder);
  }, []);

  // 过滤实验项目（实验田仅展示工具类）
  const filteredExperiments = filterExperiments(experiments, {
    viewMode: 'utility',
    searchQuery,
    completionFilter
  });

  // 根据排序模式处理项目
  const processedExperiments = sortMode === 'auto'
    ? sortExperiments(filteredExperiments, sortBy, sortOrder)
    : filteredExperiments.sort((a, b) => {
        const aOrder = a.userOrder ?? Number.MAX_SAFE_INTEGER;
        const bOrder = b.userOrder ?? Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
      });

  // 处理用户手动排序变更
  const handleOrderChange = (newItems: ExperimentItem[]) => {
    const updatedItems = experiments.map(item => {
      const newIndex = newItems.findIndex(newItem => newItem.id === item.id);
      return {
        ...item,
        userOrder: newIndex !== -1 ? newIndex : item.userOrder
      };
    });
    
    setExperiments(updatedItems);
    saveUserOrderToStorage(newItems);
  };

  // 统计数据（实验田仅展示工具类）
  const utilityExperiments = useMemo(
    () => experiments.filter((item) => item.category === 'utility'),
    [experiments],
  );
  const counts = getExperimentCounts(utilityExperiments);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserInfoBar />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <PageHeader
          counts={{
            all: counts.all,
            completed: counts.completed,
            inProgress: counts.inProgress,
          }}
        />

        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <TestFieldSearchBox
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
            <CompletionFilterComponent
              completionFilter={completionFilter}
              onCompletionFilterChange={setCompletionFilter}
              counts={{
                all: counts.all,
                completed: counts.completed,
                inProgress: counts.inProgress
              }}
            />
          </div>
          
          <SortModeToggle
            sortMode={sortMode}
            onSortModeChange={setSortMode}
          />
          
          {/* 自动排序控制（仅在自动排序模式下显示） */}
          {sortMode === 'auto' && (
            <SortControl
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
            />
          )}
        </div>

        {/* 搜索结果提示 */}
        <SearchResultHint 
          searchQuery={searchQuery}
          resultCount={processedExperiments.length}
        />

        {/* 实验项目列表或空状态 */}
        <div className="pb-20">
          {processedExperiments.length > 0 ? (
            sortMode === 'manual' ? (
              <DraggableExperimentGrid 
                items={processedExperiments} 
                onOrderChange={handleOrderChange}
              />
            ) : (
              <ExperimentGrid items={processedExperiments} />
            )
          ) : (
            <EmptyState 
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          )}
        </div>
        
        {/* 移动端排序模式提示 */}
        {isMobile && sortMode === 'manual' && (
          <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white py-3 px-4 text-center text-sm shadow-lg z-50">
            <p>您正在使用手动排序模式</p>
            <p className="text-xs mt-1">长按卡片右上角图标进行拖拽排序</p>
          </div>
        )}
      </div>
    </div>
  );
}