'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { CalendarEvent } from '../types';
import { formatDate, formatTime, isToday } from '../utils/dateUtils';
import { getEventSurfaceClasses, getPriorityLabel } from '../utils/eventDisplay';

export interface CalendarDayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onCreate: () => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarDayView({
  currentDate,
  events,
  onCreate,
  onEventClick,
}: CalendarDayViewProps) {
  const dayEvents = events
    .filter((e) => formatDate(new Date(e.startTime)) === formatDate(currentDate))
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const isTodayDate = isToday(currentDate);

  return (
    <div className="overflow-hidden rounded-2xl bg-white/90 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)]">
      <header className="border-b border-slate-100 bg-slate-50/80 px-4 py-4 text-center">
        <p className="text-xs font-medium text-slate-500">
          {currentDate.toLocaleDateString('zh-CN', { weekday: 'long' })}
        </p>
        <p
          className={`mt-1 text-3xl font-semibold tabular-nums ${
            isTodayDate ? 'text-violet-600' : 'text-slate-900'
          }`}
        >
          {currentDate.getDate()}
        </p>
        <p className="text-sm text-slate-600">
          {currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
        </p>
      </header>

      <div className="p-4">
        <button
          type="button"
          onClick={onCreate}
          className="mb-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 text-sm font-medium text-violet-700 transition-transform hover:border-violet-300 hover:bg-violet-50/50 active:scale-[0.96]"
        >
          <Plus className="h-5 w-5" />
          添加活动
        </button>

        {dayEvents.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">今日暂无活动</p>
        ) : (
          <ul className="space-y-2">
            {dayEvents.map((event) => {
              const priority = getPriorityLabel(event.priority);
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => onEventClick(event)}
                    className={`w-full rounded-xl p-4 text-left transition-transform active:scale-[0.98] ${getEventSurfaceClasses(event.color)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-slate-900">{event.title}</h3>
                      <span
                        className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs ${priority.className}`}
                      >
                        {priority.text}
                      </span>
                    </div>
                    <p className="mt-1 tabular-nums text-xs text-slate-600">
                      {event.allDay
                        ? '全天'
                        : `${formatTime(new Date(event.startTime))} – ${formatTime(new Date(event.endTime))}`}
                    </p>
                    {event.location && (
                      <p className="mt-1 truncate text-xs text-slate-500">{event.location}</p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
