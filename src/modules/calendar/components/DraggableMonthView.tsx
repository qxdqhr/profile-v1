'use client';

import React, { useMemo } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { CalendarEvent } from '../types';
import { useEventDrag } from '../hooks/useEventDrag';
import { useDeviceType } from '../utils/deviceUtils';
import { getMonthViewDates, formatDate, getWeekdayName } from '../utils/dateUtils';
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

  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useEventDrag(events, dragSupported ? onEventUpdate : async () => {});

  const monthDays = useMemo(() => {
    const dates = getMonthViewDates(currentDate);
    return dates.map((date) => ({
      date,
      isCurrentMonth: date.getMonth() === currentDate.getMonth(),
    }));
  }, [currentDate]);

  const weekDays = useMemo(
    () => monthDays.slice(0, 7).map((d) => getWeekdayName(d.date, 'zh-CN', 'short')),
    [monthDays]
  );

  const maxVisible = isMobile ? 1 : 2;

  const grid = (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] table-fixed border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/90">
            {weekDays.map((day, index) => (
              <th
                key={day}
                className={`py-2 text-center text-xs font-semibold sm:text-sm ${
                  index === 5 || index === 6 ? 'text-red-600' : 'text-slate-700'
                }`}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.replace('周', '')}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, weekIndex) => (
            <tr key={weekIndex} className="divide-x divide-slate-100">
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const dayData = monthDays[weekIndex * 7 + dayIndex];
                if (!dayData) {
                  return (
                    <td
                      key={dayIndex}
                      className="min-h-[3.5rem] border-b border-slate-100 bg-slate-50/50 sm:min-h-[5.5rem]"
                    />
                  );
                }
                return (
                  <td
                    key={dayIndex}
                    className="border-b border-slate-100 align-top p-0"
                  >
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
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white/90 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)] ${className}`}
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
        <div className="fixed bottom-20 right-4 z-50 rounded-xl bg-violet-600 px-4 py-2 text-sm text-white shadow-lg">
          拖到目标日期以移动「{dragState.draggedEvent?.title}」
        </div>
      )}
    </div>
  );
};

export default DraggableMonthView;
