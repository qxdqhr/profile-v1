 'use client';

import { useState, useEffect } from 'react';
import type { ViewMode, CompletionFilter } from '../types';
import { experiments } from '../utils/experimentData';
import { 
  filterExperiments, 
  sortExperiments, 
  getExperimentCounts
} from '../utils';

import {
  SearchBox,
  CategoryFilter,
  CompletionFilter as CompletionFilterComponent,
  PageHeader,
  SearchResultHint,
  ExperimentGrid,
  EmptyState
} from '../components';

// 主页面组件
export default function TestFieldPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>('all');

  // 从 URL 参数中获取视图模式（仅在客户端）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode') as ViewMode;
      if (mode && ['all', 'utility', 'leisure'].includes(mode)) {
        setViewMode(mode);
      }
    }
  }, []);

  // 过滤和排序实验项目
  const filteredExperiments = filterExperiments(experiments, {
    viewMode,
    searchQuery,
    completionFilter
  });

  const sortedExperiments = sortExperiments(filteredExperiments, 'title', 'asc');

  // 统计数据
  const counts = getExperimentCounts(experiments);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <PageHeader counts={counts} />

        {/* 搜索和筛选 */}
        <div className="mb-8 space-y-4">
          {/* 搜索框 */}
          <SearchBox 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* 筛选选项 */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 space-y-6 border border-gray-200">
            {/* 类别筛选 */}
            <CategoryFilter
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              counts={{ utility: counts.utility, leisure: counts.leisure }}
            />

            {/* 完成状态筛选 */}
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
        </div>

        {/* 搜索结果提示 */}
        <SearchResultHint 
          searchQuery={searchQuery}
          resultCount={sortedExperiments.length}
        />

        {/* 实验项目列表或空状态 */}
        {sortedExperiments.length > 0 ? (
          <ExperimentGrid items={sortedExperiments} />
        ) : (
          <EmptyState 
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
          />
        )}
      </div>
    </div>
  );
}