'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CalendarEvent } from '../types';
import { formatDate, isSameDay, isToday } from '../utils/dateUtils';
import DraggableEvent from './DraggableEvent';
import { useDeviceType } from '../utils/deviceUtils';

interface DroppableCalendarCellProps {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isSelected?: boolean;
  dragOverPreview?: string | null;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onShowDayEvents?: (date: Date) => void;
  className?: string;
  disableDrop?: boolean;
  maxVisibleEvents?: number;
}

export const DroppableCalendarCell: React.FC<DroppableCalendarCellProps> = ({
  date,
  events,
  isCurrentMonth,
  isSelected = false,
  dragOverPreview,
  onEventClick,
  onDateClick,
  onShowDayEvents,
  className = '',
  disableDrop = false,
  maxVisibleEvents = 2,
}) => {
  const { isMobile } = useDeviceType();
  const dateStr = formatDate(date);
  const dropId = `date-${dateStr}`;

  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    data: { date, dateStr },
    disabled: disableDrop,
  });

  const dayEvents = events.filter((event) =>
    isSameDay(new Date(event.startTime), date)
  );
  const visibleEvents = dayEvents.slice(0, maxVisibleEvents);
  const overflowCount = dayEvents.length - visibleEvents.length;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const handleCellClick = () => {
    if (isMobile && dayEvents.length > 0) {
      onShowDayEvents?.(date);
      return;
    }
    onDateClick?.(date);
  };

  return (
    <div
      ref={disableDrop ? undefined : setNodeRef}
      role="button"
      tabIndex={0}
      onClick={handleCellClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCellClick();
        }
      }}
      className={[
        'relative flex h-full min-h-[3.5rem] w-full flex-col p-1 sm:min-h-[5.5rem] sm:p-1.5',
        'cursor-pointer transition-[background-color,box-shadow] duration-200',
        !isCurrentMonth ? 'bg-slate-50/90 text-slate-400' : 'bg-white',
        isToday(date) && isCurrentMonth ? 'bg-violet-50/90' : '',
        isSelected ? 'ring-2 ring-inset ring-violet-400' : '',
        isOver ? 'bg-violet-100/90 ring-2 ring-inset ring-violet-300' : '',
        className,
      ].join(' ')}
    >
      <div className="mb-0.5 flex items-center justify-between gap-0.5">
        <span
          className={[
            'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums sm:h-7 sm:w-7 sm:text-sm',
            !isCurrentMonth ? 'text-slate-400' : isWeekend ? 'text-red-600' : 'text-slate-800',
            isToday(date) && isCurrentMonth ? 'bg-violet-600 text-white shadow-sm' : '',
          ].join(' ')}
        >
          {date.getDate()}
        </span>
        {dayEvents.length > 0 && isCurrentMonth && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShowDayEvents?.(date);
            }}
            className="flex h-6 min-w-[1.25rem] items-center justify-center rounded-full bg-violet-600/90 px-1 text-[10px] font-semibold tabular-nums text-white sm:h-7 sm:min-w-[1.5rem] sm:text-xs"
            aria-label={`${dayEvents.length} 个活动，点击查看`}
          >
            {dayEvents.length}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        {isCurrentMonth &&
          visibleEvents.map((event) => (
            <div
              key={event.id}
              className="min-w-0"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <DraggableEvent
                event={event}
                className="text-[10px] sm:text-xs"
                onClick={() => onEventClick?.(event)}
              />
            </div>
          ))}
        {overflowCount > 0 && isCurrentMonth && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShowDayEvents?.(date);
            }}
            className="rounded-md px-1 py-0.5 text-left text-[10px] font-medium text-violet-700 hover:bg-violet-100 sm:text-xs"
          >
            +{overflowCount} 项
          </button>
        )}
      </div>

      {isOver && dragOverPreview && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed border-violet-300 bg-violet-50/90">
          <span className="text-xs font-medium text-violet-700">{dragOverPreview}</span>
        </div>
      )}
    </div>
  );
};

export default DroppableCalendarCell;
