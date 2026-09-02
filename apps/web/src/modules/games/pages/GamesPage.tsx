'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BackButton } from 'sa2kit/common/ui/patterns/next';
import { SearchBox, SearchResultHint } from 'sa2kit/common/ui/patterns';
import { FilterButtonGroup } from 'sa2kit/common/ui/patterns';
import type { ExperimentItem } from '@/modules/testField/types';
import { ExperimentGrid } from '@/modules/testField/components';
import { games as allGames } from '../utils/gamesData';
import { filterGames, getGameCounts, sortGames } from '../utils';
import type { GamePlatformFilter } from '../types';

function toExperimentItem(game: (typeof allGames)[number]): ExperimentItem {
  return {
    id: game.id,
    title: game.title,
    description: game.description,
    path: game.path,
    tags: game.tags,
    category: 'leisure',
    isCompleted: game.isCompleted,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  };
}

const platformOptions = [
  {
    value: 'all' as const,
    label: '全部',
    icon: '🎮',
    activeColor: { bg: 'bg-blue-500', shadow: 'shadow-blue-200' },
    showCount: false,
  },
  {
    value: 'godot' as const,
    label: 'Godot',
    icon: '🕹️',
    activeColor: { bg: 'bg-emerald-500', shadow: 'shadow-emerald-200' },
    showCount: true,
  },
  {
    value: 'web' as const,
    label: 'Web 互动',
    icon: '🌐',
    activeColor: { bg: 'bg-violet-500', shadow: 'shadow-violet-200' },
    showCount: true,
  },
];

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [platform, setPlatform] = useState<GamePlatformFilter>('all');

  const counts = useMemo(() => getGameCounts(allGames), []);

  const items = useMemo(() => {
    const filtered = filterGames(allGames, searchQuery, platform);
    return sortGames(filtered).map(toExperimentItem);
  }, [searchQuery, platform]);

  const platformCounts = { godot: counts.godot, web: counts.web };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <BackButton />
          <Link
            href="/testField"
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            实验田工具 →
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">小游戏大厅</h1>
          <p className="mt-2 text-sm text-gray-600">
            Godot 旁路游戏与 Web 互动体验；点击卡片进入游玩
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
            <span>共 {counts.all} 款</span>
            <span>Godot {counts.godot} 款</span>
            <span>Web {counts.web} 款</span>
            <span>已完成 {counts.completed} 款</span>
          </div>
        </div>

        <div className="mb-6 sm:mb-8 space-y-4">
          <SearchBox searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          <div className="bg-white/80 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
            <FilterButtonGroup
              label="平台"
              value={platform}
              options={platformOptions.map((opt) => ({
                ...opt,
                count:
                  opt.value === 'godot'
                    ? platformCounts.godot
                    : opt.value === 'web'
                      ? platformCounts.web
                      : undefined,
              }))}
              onChange={setPlatform}
            />
          </div>
        </div>

        <SearchResultHint searchQuery={searchQuery} resultCount={items.length} />

        <div className="pb-12 mt-6">
          {items.length > 0 ? (
            <ExperimentGrid items={items} />
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p>没有找到匹配的游戏</p>
              <button
                type="button"
                className="mt-4 text-indigo-600 hover:underline"
                onClick={() => setSearchQuery('')}
              >
                清除搜索
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
