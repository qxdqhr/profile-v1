'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { CalendarEvent } from '../types';
import { formatDate, isToday } from '../utils/dateUtils';
import { getEventSurfaceClasses, getPriorityLabel } from '../utils/eventDisplay';
import { useCalendarSettings } from '../context/CalendarSettingsContext';
import {
  formatTimeForSettings,
  getLunarDayLabel,
} from '../utils/calendarSettingsCore';

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
  const { settings } = useCalendarSettings();

  const dayEvents = events
    .filter((e) => formatDate(new Date(e.startTime)) === formatDate(currentDate))
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const isTodayDate = isToday(currentDate);
  const lunarLabel = settings.showLunarCalendar
    ? getLunarDayLabel(currentDate, settings.language)
    : null;

  return (
    <div
      className="overflow-hidden rounded-2xl bg-white/90 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)]"
      style={{ backgroundColor: 'var(--cal-bg, #ffffff)' }}
    >
      <header className="border-b border-slate-100 bg-slate-50/80 px-4 py-4 text-center">
        <p className="text-xs font-medium text-slate-500">
          {currentDate.toLocaleDateString(settings.language, { weekday: 'long' })}
        </p>
        <p
          className="mt-1 text-3xl font-semibold tabular-nums"
          style={{ color: isTodayDate ? 'var(--cal-primary, #7c3aed)' : 'var(--cal-text, #0f172a)' }}
        >
          {currentDate.getDate()}
        </p>
        <p className="text-sm text-slate-600">
          {currentDate.toLocaleDateString(settings.language, {
            year: 'numeric',
            month: 'long',
          })}
        </p>
        {lunarLabel && <p className="mt-1 text-xs text-slate-400">农历 {lunarLabel}</p>}
        <p className="mt-2 text-xs text-slate-400">
          工作时间 {settings.workingHours.start} – {settings.workingHours.end}
        </p>
      </header>

      <div className="p-4">
        <button
          type="button"
          onClick={onCreate}
          className="mb-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm font-medium transition-transform hover:opacity-90 active:scale-[0.96]"
          style={{
            borderColor: 'color-mix(in srgb, var(--cal-primary, #7c3aed) 35%, transparent)',
            color: 'var(--cal-primary, #7c3aed)',
          }}
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
                        : `${formatTimeForSettings(new Date(event.startTime), settings)} – ${formatTimeForSettings(new Date(event.endTime), settings)}`}
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
