'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarViewType } from '../types';

export interface CalendarToolbarProps {
  title: string;
  viewType: CalendarViewType;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewTypeChange: (view: CalendarViewType) => void;
}

const VIEW_OPTIONS: { key: CalendarViewType; label: string }[] = [
  { key: CalendarViewType.MONTH, label: '月' },
  { key: CalendarViewType.WEEK, label: '周' },
  { key: CalendarViewType.DAY, label: '日' },
];

export default function CalendarToolbar({
  title,
  viewType,
  onPrevious,
  onNext,
  onToday,
  onViewTypeChange,
}: CalendarToolbarProps) {
  return (
    <div className="rounded-2xl bg-white/90 p-3 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)] sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <button
            type="button"
            onClick={onPrevious}
            aria-label="上一段"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-transform hover:bg-slate-100 active:scale-[0.96]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="min-w-0 flex-1 text-center text-base font-semibold text-balance text-slate-900 sm:min-w-[10rem] sm:text-lg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onNext}
            aria-label="下一段"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-transform hover:bg-slate-100 active:scale-[0.96]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onToday}
            className="h-10 rounded-xl bg-violet-600 px-4 text-sm font-medium text-white shadow-sm shadow-violet-500/20 transition-transform hover:bg-violet-700 active:scale-[0.96]"
          >
            今天
          </button>
          <div
            className="inline-flex rounded-xl bg-slate-100/90 p-1"
            role="group"
            aria-label="日历视图"
          >
            {VIEW_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => onViewTypeChange(key)}
                aria-pressed={viewType === key}
                className={`h-8 min-w-[2.25rem] rounded-lg px-3 text-sm font-medium transition-[background-color,color,box-shadow] ${
                  viewType === key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
