'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Pencil, Trash2, MapPin, Clock } from 'lucide-react';
import { CalendarEvent } from '../types';
import { formatDate, isToday } from '../utils/dateUtils';
import { getEventSurfaceClasses, getPriorityLabel } from '../utils/eventDisplay';
import { useCalendarSettings } from '../context/CalendarSettingsContext';
import { formatTimeForSettings } from '../utils/calendarSettingsCore';

export interface DayEventsSheetProps {
  date: Date | null;
  events: CalendarEvent[];
  isOpen: boolean;
  onClose: () => void;
  onCreate: (date: Date) => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: number) => void;
  isAuthenticated: boolean;
  onRequireLogin: () => void;
}

export default function DayEventsSheet({
  date,
  events,
  isOpen,
  onClose,
  onCreate,
  onEdit,
  onDelete,
  isAuthenticated,
  onRequireLogin,
}: DayEventsSheetProps) {
  const { settings } = useCalendarSettings();

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const dayEvents = date
    ? events
        .filter((e) => formatDate(new Date(e.startTime)) === formatDate(date))
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    : [];

  const title = date
    ? date.toLocaleDateString(settings.language, {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : '';

  const handleCreate = () => {
    if (!date) return;
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    onCreate(date);
  };

  return (
    <AnimatePresence>
      {isOpen && date && (
        <>
          <motion.button
            type="button"
            aria-label="关闭"
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-events-title"
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[min(85vh,640px)] flex-col rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(15,23,42,0.12)] md:inset-x-auto md:left-1/2 md:top-1/2 md:max-h-[min(80vh,560px)] md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:shadow-xl"
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
          >
            <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-slate-200 md:hidden" />
            <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-violet-600">
                  {isToday(date) ? '今天' : formatDate(date)}
                </p>
                <h2
                  id="day-events-title"
                  className="mt-0.5 text-balance text-lg font-semibold text-slate-900"
                >
                  {title}
                </h2>
                <p className="mt-1 tabular-nums text-sm text-slate-500">
                  {dayEvents.length} 个活动
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-transform hover:bg-slate-100 active:scale-[0.96]"
                aria-label="关闭面板"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5">
              {dayEvents.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-slate-600">这一天还没有安排</p>
                  <p className="mt-1 text-xs text-slate-400">点击下方按钮添加活动</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {dayEvents.map((event, index) => {
                    const priority = getPriorityLabel(event.priority);
                    return (
                      <motion.li
                        key={event.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        className={`rounded-xl p-3 ${getEventSurfaceClasses(event.color)}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="mt-1 h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: event.color || '#3B82F6' }}
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate font-medium text-slate-900">
                                {event.title}
                              </h3>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${priority.className}`}
                              >
                                {priority.text}
                              </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                              <span className="inline-flex items-center gap-1 tabular-nums">
                                <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                {event.allDay
                                  ? '全天'
                                  : `${formatTimeForSettings(new Date(event.startTime), settings)} – ${formatTimeForSettings(new Date(event.endTime), settings)}`}
                              </span>
                              {event.location && (
                                <span className="inline-flex min-w-0 items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                  <span className="truncate">{event.location}</span>
                                </span>
                              )}
                            </div>
                            {event.description && (
                              <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end gap-1 border-t border-black/5 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!isAuthenticated) {
                                onRequireLogin();
                                return;
                              }
                              onEdit(event);
                            }}
                            className="inline-flex h-10 min-w-[2.5rem] items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium text-violet-700 transition-transform hover:bg-violet-500/10 active:scale-[0.96]"
                          >
                            <Pencil className="h-4 w-4" />
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!isAuthenticated) {
                                onRequireLogin();
                                return;
                              }
                              onDelete(event.id);
                            }}
                            className="inline-flex h-10 min-w-[2.5rem] items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium text-red-600 transition-transform hover:bg-red-500/10 active:scale-[0.96]"
                          >
                            <Trash2 className="h-4 w-4" />
                            删除
                          </button>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>

            <footer className="border-t border-slate-100 p-4 sm:px-5 sm:pb-5">
              <button
                type="button"
                onClick={handleCreate}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-transform hover:bg-violet-700 active:scale-[0.96]"
              >
                <Plus className="h-5 w-5" />
                添加活动
              </button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
