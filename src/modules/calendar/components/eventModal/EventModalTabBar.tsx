'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlignLeft, Clock, Layers, Palette } from 'lucide-react';

export type EventModalTab = 'type' | 'details' | 'schedule' | 'appearance';

export interface EventModalTabItem {
  id: EventModalTab;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  createOnly?: boolean;
}

export const EVENT_MODAL_TABS: EventModalTabItem[] = [
  { id: 'type', label: '类型', icon: Layers, createOnly: true },
  { id: 'details', label: '详情', icon: AlignLeft },
  { id: 'schedule', label: '时间', icon: Clock },
  { id: 'appearance', label: '样式', icon: Palette },
];

interface EventModalTabBarProps {
  activeTab: EventModalTab;
  onTabChange: (tab: EventModalTab) => void;
  isEditMode: boolean;
}

export default function EventModalTabBar({
  activeTab,
  onTabChange,
  isEditMode,
}: EventModalTabBarProps) {
  const visibleTabs = EVENT_MODAL_TABS.filter((tab) => !tab.createOnly || !isEditMode);

  return (
    <div
      className="rounded-2xl bg-slate-100/80 p-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
      role="tablist"
      aria-label="活动表单分区"
    >
      <div className="flex gap-1 overflow-x-auto">
        {visibleTabs.map((tab) => {
          const selected = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={(e) => {
                onTabChange(tab.id);
                e.currentTarget.blur();
              }}
              className={`relative flex h-10 min-w-[4.5rem] flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-[background-color,color,box-shadow,transform] active:scale-[0.96] sm:min-w-0 ${
                selected
                  ? 'bg-white text-violet-700 shadow-sm shadow-violet-500/10'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={selected ? 2.25 : 2} />
              <span className="truncate">{tab.label}</span>
              {selected && (
                <motion.span
                  layoutId="event-modal-tab-indicator"
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-violet-500"
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
