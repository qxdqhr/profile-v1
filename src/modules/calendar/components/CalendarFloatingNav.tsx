'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
  LogIn,
  Settings,
} from 'lucide-react';
import { UserMenu } from 'sa2kit/auth/legacy';

export type CalendarMainTab = 'calendar' | 'events' | 'tools' | 'settings';

export interface CalendarFloatingNavProps {
  activeTab: CalendarMainTab;
  onTabChange: (tab: CalendarMainTab) => void;
  isAuthenticated: boolean;
  onLoginClick: () => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
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

export default function CalendarFloatingNav({
  activeTab,
  onTabChange,
  isAuthenticated,
  onLoginClick,
  collapsed,
  onCollapsedChange,
  onOpenSettings,
}: CalendarFloatingNavProps) {
  return (
    <motion.aside
      aria-label="日历功能导航"
      className="fixed left-3 top-1/2 z-40 flex max-h-[min(88vh,640px)] -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white/95 shadow-[0_4px_24px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] backdrop-blur-md sm:left-4"
      initial={false}
      animate={{ width: collapsed ? 56 : 200 }}
      transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
    >
      <div className="flex items-center justify-between border-b border-black/[0.04] px-2 py-2">
        <AnimatePresence initial={false} mode="wait">
          {!collapsed && (
            <motion.span
              key="nav-title"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
              className="truncate px-1 text-xs font-semibold uppercase tracking-wide text-violet-600"
            >
              功能
            </motion.span>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-transform hover:bg-slate-100 active:scale-[0.96]"
          aria-label={collapsed ? '展开导航' : '折叠导航'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          ) : (
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2" role="tablist">
        {NAV_ITEMS.map((item, index) => {
          const selected = activeTab === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: collapsed ? 0 : index * 0.04, type: 'spring', duration: 0.3, bounce: 0 }}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`flex h-10 w-full items-center gap-3 rounded-xl px-2.5 text-sm font-medium transition-[background-color,color,box-shadow] active:scale-[0.96] ${
                selected
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  selected ? 'bg-white/15' : 'bg-slate-100/80'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={selected ? 2.25 : 2} />
              </span>
              <AnimatePresence initial={false} mode="wait">
                {!collapsed && (
                  <motion.span
                    key={`${item.id}-label`}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                    className="truncate text-left"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      <div className="border-t border-black/[0.04] p-2">
        {isAuthenticated ? (
          <div
            className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2 rounded-xl bg-slate-50/80 px-2 py-1.5'}`}
          >
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
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                  className="min-w-0 flex-1 truncate text-xs text-slate-500"
                >
                  已登录
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            type="button"
            onClick={onLoginClick}
            title={collapsed ? '登录' : undefined}
            className={`flex h-10 w-full items-center gap-3 rounded-xl bg-violet-600 text-sm font-medium text-white shadow-sm shadow-violet-500/20 transition-transform hover:bg-violet-700 active:scale-[0.96] ${
              collapsed ? 'justify-center px-0' : 'px-3'
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <LogIn className="h-4 w-4" strokeWidth={2} />
            </span>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                >
                  登录
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    </motion.aside>
  );
}
