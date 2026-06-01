'use client';

import React, { useMemo } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { CalendarEvent } from '../types';
import { useEventDrag } from '../hooks/useEventDrag';
import { useDeviceType } from '../utils/deviceUtils';
import { getMonthViewDates, getWeekdayName } from '../utils/dateUtils';
import { useCalendarSettings } from '../context/CalendarSettingsContext';
import {
  getISOWeekNumber,
  isWeekendColumn,
} from '../utils/calendarSettingsCore';
import DroppableCalendarCell from './DroppableCalendarCell';
import DraggableEvent from './DraggableEvent';

interface DraggableMonthViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onShowDayEvents?: (date: Date) => void;
  onEventUpdate: (eventId: number, newStartTime: Date, newEndTime: Date) => Promise<void>;
  className?: string;
}

export const DraggableMonthView: React.FC<DraggableMonthViewProps> = ({
  events,
  currentDate,
  onEventClick,
  onDateClick,
  onShowDayEvents,
  onEventUpdate,
  className = '',
}) => {
  const { isMobile, dragSupported } = useDeviceType();
  const { settings } = useCalendarSettings();

  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useEventDrag(events, dragSupported ? onEventUpdate : async () => {});

  const monthDays = useMemo(() => {
    const dates = getMonthViewDates(currentDate, settings.weekStartsOn);
    return dates.map((date) => ({
      date,
      isCurrentMonth: date.getMonth() === currentDate.getMonth(),
    }));
  }, [currentDate, settings.weekStartsOn]);

  const weekDays = useMemo(
    () =>
      monthDays
        .slice(0, 7)
        .map((d) => getWeekdayName(d.date, settings.language, 'short')),
    [monthDays, settings.language]
  );

  const maxVisible = isMobile ? 1 : 2;

  const grid = (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] table-fixed border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/90">
            {settings.showWeekNumbers && (
              <th className="w-10 py-2 text-center text-xs font-semibold text-slate-500 sm:text-sm">
                周
              </th>
            )}
            {weekDays.map((day, index) => (
              <th
                key={`${day}-${index}`}
                className="py-2 text-center text-xs font-semibold sm:text-sm"
                style={{
                  color: isWeekendColumn(index, settings.weekStartsOn)
                    ? 'var(--cal-weekend-text, #dc2626)'
                    : 'var(--cal-text, #334155)',
                }}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.replace('周', '')}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, weekIndex) => {
            const rowStart = monthDays[weekIndex * 7];
            const weekNumber = rowStart ? getISOWeekNumber(rowStart.date) : null;

            return (
              <tr key={weekIndex} className="divide-x divide-slate-100">
                {settings.showWeekNumbers && (
                  <td className="border-b border-slate-100 bg-slate-50/80 py-2 text-center align-middle text-xs font-medium tabular-nums text-slate-500 sm:text-sm">
                    {weekNumber}
                  </td>
                )}
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dayData = monthDays[weekIndex * 7 + dayIndex];
                  if (!dayData) {
                    return (
                      <td
                        key={dayIndex}
                        colSpan={settings.showWeekNumbers && dayIndex === 0 ? 1 : 1}
                        className="min-h-[3.5rem] border-b border-slate-100 sm:min-h-[5.5rem]"
                        style={{ backgroundColor: 'var(--cal-other-month-bg, #f8fafc)' }}
                      />
                    );
                  }
                  return (
                    <td key={dayIndex} className="border-b border-slate-100 align-top p-0">
                      <DroppableCalendarCell
                        date={dayData.date}
                        events={events}
                        isCurrentMonth={dayData.isCurrentMonth}
                        dragOverPreview={dragSupported ? dragState.previewTime : null}
                        onEventClick={onEventClick}
                        onDateClick={onDateClick}
                        onShowDayEvents={onShowDayEvents}
                        disableDrop={!dragSupported}
                        maxVisibleEvents={maxVisible}
                        className="h-full min-h-[3.5rem] border-0 sm:min-h-[5.5rem]"
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white/90 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)] ${className}`}
      style={{ backgroundColor: 'var(--cal-bg, #ffffff)' }}
    >
      {dragSupported && !isMobile && (
        <p className="hidden border-b border-slate-100 px-4 py-2 text-xs text-slate-500 md:block">
          桌面端可拖拽活动调整日期
        </p>
      )}

      {dragSupported ? (
        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {grid}
          <DragOverlay>
            {dragState.isDragging && dragState.draggedEvent && (
              <div className="pointer-events-none rotate-1 scale-105">
                <DraggableEvent
                  event={dragState.draggedEvent}
                  isDragging
                  className="shadow-lg ring-1 ring-violet-400"
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        grid
      )}

      {dragSupported && dragState.isDragging && (
        <div
          className="fixed bottom-20 right-4 z-50 rounded-xl px-4 py-2 text-sm text-white shadow-lg"
          style={{ backgroundColor: 'var(--cal-primary, #7c3aed)' }}
        >
          拖到目标日期以移动「{dragState.draggedEvent?.title}」
        </div>
      )}
    </div>
  );
};

export default DraggableMonthView;
