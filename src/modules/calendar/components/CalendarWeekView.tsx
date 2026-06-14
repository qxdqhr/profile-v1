'use client';

import React, { useMemo } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { CalendarEvent } from '../types';
import {
  getWeekViewDates,
  formatDate,
  isToday,
  getWeekdayName,
} from '../utils/dateUtils';
import { getEventSurfaceClasses, getPriorityLabel } from '../utils/eventDisplay';
import { useCalendarSettings } from '../context/CalendarSettingsContext';
import {
  formatTimeForSettings,
  getLunarDayLabel,
  type CalendarSettings,
} from '../utils/calendarSettingsCore';

export interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onShowDayEvents: (date: Date) => void;
}

function formatEventTimeRange(event: CalendarEvent, settings: CalendarSettings) {
  if (event.allDay) return '全天';
  const start = formatTimeForSettings(new Date(event.startTime), settings);
  const end = formatTimeForSettings(new Date(event.endTime), settings);
  return `${start} – ${end}`;
}

export default function CalendarWeekView({
  currentDate,
  events,
  onDateClick,
  onEventClick,
  onShowDayEvents,
}: CalendarWeekViewProps) {
  const { settings } = useCalendarSettings();
  const weekDates = getWeekViewDates(currentDate, settings.weekStartsOn);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const date of weekDates) {
      map.set(formatDate(date), []);
    }
    for (const event of events) {
      const key = formatDate(new Date(event.startTime));
      const bucket = map.get(key);
      if (bucket) {
        bucket.push(event);
      }
    }
    for (const [, dayEvents] of map) {
      dayEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    }
    return map;
  }, [events, weekDates]);

  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  return (
    <div
      className="overflow-hidden rounded-2xl bg-white/90 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)]"
      style={{ backgroundColor: 'var(--cal-bg, #ffffff)' }}
    >
      <header className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5">
        <p className="text-sm font-medium text-slate-600">本周日程</p>
        <p className="mt-0.5 text-xs text-slate-400 tabular-nums">
          {weekStart.toLocaleDateString(settings.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          {' – '}
          {weekEnd.toLocaleDateString(settings.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </header>

      <div className="divide-y divide-slate-100">
        {weekDates.map((date) => {
          const dateKey = formatDate(date);
          const dayEvents = eventsByDate.get(dateKey) ?? [];
          const isTodayDate = isToday(date);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const lunarLabel = settings.showLunarCalendar
            ? getLunarDayLabel(date, settings.language)
            : null;

          return (
            <section
              key={dateKey}
              className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:gap-4 sm:px-4 sm:py-4"
              style={{
                backgroundColor: isTodayDate
                  ? 'var(--cal-today-bg, #f5f3ff)'
                  : isWeekend
                    ? 'var(--cal-weekend-bg, #ffffff)'
                    : 'var(--cal-cell-bg, #ffffff)',
              }}
            >
              <button
                type="button"
                onClick={() => onDateClick(date)}
                className="group flex shrink-0 items-center gap-3 rounded-xl px-1 py-1 text-left transition-colors hover:bg-white/60 sm:w-36 sm:flex-col sm:items-start sm:gap-1 sm:px-2 sm:py-2"
              >
                <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-0.5">
                  <span
                    className="text-xs font-semibold uppercase tracking-wide sm:text-sm"
                    style={{
                      color: isWeekend
                        ? 'var(--cal-weekend-text, #dc2626)'
                        : 'var(--cal-text-muted, #64748b)',
                    }}
                  >
                    {getWeekdayName(date, settings.language, 'short')}
                  </span>
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold tabular-nums sm:h-10 sm:w-10 ${
                      isTodayDate ? 'text-white shadow-sm' : ''
                    }`}
                    style={
                      isTodayDate
                        ? { backgroundColor: 'var(--cal-primary, #7c3aed)' }
                        : { color: 'var(--cal-text, #1e293b)' }
                    }
                  >
                    {date.getDate()}
                  </span>
                </div>
                <div className="min-w-0 sm:w-full">
                  <p className="text-xs text-slate-500 tabular-nums">
                    {date.toLocaleDateString(settings.language, { month: 'short', day: 'numeric' })}
                  </p>
                  {lunarLabel && (
                    <p className="mt-0.5 text-[10px] text-slate-400">农历 {lunarLabel}</p>
                  )}
                  <p className="mt-1 hidden text-[10px] text-violet-600 opacity-0 transition-opacity group-hover:opacity-100 sm:block">
                    点击新建
                  </p>
                </div>
              </button>

              <div className="min-w-0 flex-1">
                {dayEvents.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => onDateClick(date)}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-slate-400 transition-colors hover:border-violet-300 hover:text-violet-600"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--cal-primary, #7c3aed) 20%, #e2e8f0)',
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    暂无活动，点击添加
                  </button>
                ) : (
                  <ul className="space-y-2">
                    {dayEvents.map((event) => {
                      const priority = getPriorityLabel(event.priority);
                      return (
                        <li key={event.id}>
                          <button
                            type="button"
                            onClick={() => onEventClick(event)}
                            className={`w-full rounded-xl px-3 py-2.5 text-left transition-transform active:scale-[0.99] sm:px-4 sm:py-3 ${getEventSurfaceClasses(event.color)}`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                                  {event.title}
                                </h3>
                                <p className="mt-0.5 text-xs tabular-nums text-slate-600 sm:text-sm">
                                  {formatEventTimeRange(event, settings)}
                                </p>
                              </div>
                              <span
                                className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium sm:text-xs ${priority.className}`}
                              >
                                {priority.text}
                              </span>
                            </div>
                            {event.description && (
                              <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">
                                {event.description}
                              </p>
                            )}
                            {event.location && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </p>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {dayEvents.length > 4 && (
                  <button
                    type="button"
                    onClick={() => onShowDayEvents(date)}
                    className="mt-2 text-xs font-medium text-violet-700 hover:underline"
                  >
                    查看全部 {dayEvents.length} 项
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
