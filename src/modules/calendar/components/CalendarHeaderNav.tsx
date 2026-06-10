'use client';

import React from 'react';
import { Calculator, CalendarDays, List, LogIn, Settings } from 'lucide-react';
import { UserMenu } from '@/lib/auth';

export type CalendarMainTab = 'calendar' | 'events' | 'tools' | 'settings';

export interface CalendarHeaderNavProps {
  activeTab: CalendarMainTab;
  onTabChange: (tab: CalendarMainTab) => void;
  isAuthenticated: boolean;
  onLoginClick: () => void;
  onOpenSettings?: () => void;
}

const NAV_ITEMS: {
  id: CalendarMainTab;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { id: 'calendar', label: '日历', icon: CalendarDays },
  { id: 'events', label: '全部活动', icon: List },
  { id: 'tools', label: '日期工具', icon: Calculator },
  { id: 'settings', label: '设置', icon: Settings },
];

export default function CalendarHeaderNav({
  activeTab,
  onTabChange,
  isAuthenticated,
  onLoginClick,
  onOpenSettings,
}: CalendarHeaderNavProps) {
  return (
    <header className="mb-4 space-y-3 sm:mb-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 shrink-0 text-balance text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          日历
        </h1>

        <div className="flex shrink-0 items-center">
          {isAuthenticated ? (
            <UserMenu
              customMenuItems={
                onOpenSettings
                  ? [
                      {
                        id: 'settings',
                        label: '个人设置',
                        icon: Settings,
                        onClick: onOpenSettings,
                      },
                    ]
                  : undefined
              }
            />
          ) : (
            <button
              type="button"
              onClick={onLoginClick}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-medium text-white shadow-sm shadow-violet-500/20 transition-transform hover:bg-violet-700 active:scale-[0.96]"
            >
              <LogIn className="h-4 w-4" strokeWidth={2} />
              登录
            </button>
          )}
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto rounded-2xl bg-slate-100/80 p-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
        role="tablist"
        aria-label="日历功能导航"
      >
          {NAV_ITEMS.map((item) => {
            const selected = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onTabChange(item.id)}
                className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-[background-color,color,box-shadow,transform] active:scale-[0.96] sm:px-4 ${
                  selected
                    ? 'bg-white text-violet-700 shadow-sm shadow-violet-500/10'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={selected ? 2.25 : 2} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
      </nav>
    </header>
  );
}
