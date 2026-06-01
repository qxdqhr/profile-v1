'use client';

import React from 'react';
import { CalendarEvent } from '../types';
import {
  getWeekViewDates,
  formatDate,
  isToday,
  getWeekdayName,
} from '../utils/dateUtils';
import { getEventSurfaceClasses } from '../utils/eventDisplay';
import { useCalendarSettings } from '../context/CalendarSettingsContext';
import { getLunarDayLabel, isWeekendColumn } from '../utils/calendarSettingsCore';

export interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onShowDayEvents: (date: Date) => void;
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

  const getEventsForDate = (date: Date) =>
    events.filter((e) => formatDate(new Date(e.startTime)) === formatDate(date));

  return (
    <div
      className="overflow-hidden rounded-2xl bg-white/90 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)]"
      style={{ backgroundColor: 'var(--cal-bg, #ffffff)' }}
    >
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80">
        {weekDates.map((date, index) => (
          <div
            key={formatDate(date)}
            className="py-2 text-center text-xs font-semibold sm:text-sm"
            style={{
              color: isWeekendColumn(index, settings.weekStartsOn)
                ? 'var(--cal-weekend-text, #dc2626)'
                : 'var(--cal-text, #334155)',
            }}
          >
            <span className="hidden sm:inline">
              {getWeekdayName(date, settings.language, 'short')}
            </span>
            <span className="sm:hidden">
              {getWeekdayName(date, settings.language, 'short').slice(-1)}
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-slate-100">
        {weekDates.map((date) => {
          const dayEvents = getEventsForDate(date);
          const isTodayDate = isToday(date);
          const visible = dayEvents.slice(0, 3);
          const overflow = dayEvents.length - visible.length;
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const lunarLabel = settings.showLunarCalendar
            ? getLunarDayLabel(date, settings.language)
            : null;

          return (
            <button
              key={formatDate(date)}
              type="button"
              onClick={() => onDateClick(date)}
              className="flex min-h-[7rem] flex-col p-1.5 text-left transition-colors hover:opacity-95 sm:min-h-[9rem] sm:p-2"
              style={{
                backgroundColor: isTodayDate
                  ? 'var(--cal-today-bg, #f5f3ff)'
                  : isWeekend
                    ? 'var(--cal-weekend-bg, #ffffff)'
                    : 'var(--cal-cell-bg, #ffffff)',
              }}
            >
              <div className="mb-1 flex flex-col items-center justify-center">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold tabular-nums sm:h-9 sm:w-9 ${
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
                {lunarLabel && (
                  <span className="mt-0.5 text-[10px] text-slate-400">{lunarLabel}</span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                {visible.map((event) => (
                  <span
                    key={event.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation();
                        onEventClick(event);
                      }
                    }}
                    className={`block truncate rounded-md px-1 py-0.5 text-[10px] font-medium sm:text-xs ${getEventSurfaceClasses(event.color)}`}
                  >
                    {event.title}
                  </span>
                ))}
                {overflow > 0 && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowDayEvents(date);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation();
                        onShowDayEvents(date);
                      }
                    }}
                    className="rounded-md px-1 py-0.5 text-center text-[10px] font-medium hover:bg-violet-100 sm:text-xs"
                    style={{ color: 'var(--cal-primary, #7c3aed)' }}
                  >
                    +{overflow} 项
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
