'use client';

import React, { useState, useMemo } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { CalendarEvent } from '../types';
import { useEventDrag } from '../hooks/useEventDrag';
import { 
  getMonthViewDates, 
  formatDate, 
  addMonths, 
  getMonthName,
  getWeekdayName
} from '../utils/dateUtils';
import DroppableCalendarCell from './DroppableCalendarCell';
import DraggableEvent from './DraggableEvent';

interface DraggableMonthViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onEventUpdate: (eventId: number, newStartTime: Date, newEndTime: Date) => Promise<void>;
  className?: string;
}

/**
 * 支持拖拽的月视图组件
 * 
 * 功能特性：
 * - 完整的月视图日历
 * - 事件拖拽功能
 * - 拖拽预览和反馈
 * - 月份导航
 * - 响应式设计
 */
export const DraggableMonthView: React.FC<DraggableMonthViewProps> = ({
  events,
  currentDate,
  onDateChange,
  onEventClick,
  onDateClick,
  onEventUpdate,
  className = ''
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 使用拖拽Hook
  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useEventDrag(events, onEventUpdate);

  // 获取月份的所有日期
  const monthDays = useMemo(() => {
    const dates = getMonthViewDates(currentDate);
    return dates.map(date => ({
      date,
      isCurrentMonth: date.getMonth() === currentDate.getMonth()
    }));
  }, [currentDate]);

  // 周标题 - 基于实际日期生成，确保与日期网格匹配
  const weekDays = useMemo(() => {
    return monthDays.slice(0, 7).map(dayData => 
      getWeekdayName(dayData.date, 'zh-CN', 'short')
    );
  }, [monthDays]);

  // 月份导航
  const goToPreviousMonth = () => {
    onDateChange(addMonths(currentDate, -1));
  };

  const goToNextMonth = () => {
    onDateChange(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  // 处理日期点击
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* 月份标题和导航 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentDate.getFullYear()}年{getMonthName(currentDate)}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
          >
            今天
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="上个月"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="下个月"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 拖拽上下文 */}
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* 使用表格布局确保正确的日历网格 */}
        <div className="overflow-hidden border border-gray-300 rounded-lg">
          <table className="w-full table-fixed border-collapse">
            {/* 周标题 */}
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                {weekDays.map((day, index) => (
                  <th 
                    key={day} 
                    className={`p-3 text-center text-sm font-bold border-r border-gray-300 last:border-r-0 ${
                      index === 5 || index === 6 ? 'text-red-600 bg-red-50' : 'text-gray-800'
                    }`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            
            {/* 日历网格 - 按周分组 */}
            <tbody>
              {Array.from({ length: 6 }, (_, weekIndex) => (
                <tr key={weekIndex}>
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const dateIndex = weekIndex * 7 + dayIndex;
                    const dayData = monthDays[dateIndex];
                    
                    if (!dayData) {
                      return (
                        <td key={dayIndex} className="h-32 border-b border-gray-300 border-r border-gray-300 last:border-r-0 bg-gray-100"></td>
                      );
                    }
                    
                    const isWeekend = dayData.date.getDay() === 0 || dayData.date.getDay() === 6;
                    
                    return (
                      <td
                        key={dayIndex}
                        className={`h-32 border-b border-gray-300 border-r border-gray-300 last:border-r-0 relative ${
                          isWeekend ? 'bg-red-50' : 'bg-white'
                        } hover:bg-blue-50 transition-colors`}
                      >
                        <DroppableCalendarCell
                          date={dayData.date}
                          events={events}
                          isCurrentMonth={dayData.isCurrentMonth}
                          isSelected={selectedDate ? formatDate(selectedDate) === formatDate(dayData.date) : false}
                          dragOverPreview={dragState.previewTime}
                          onEventClick={onEventClick}
                          onDateClick={handleDateClick}
                          className="h-full border-0"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 拖拽覆盖层 */}
        <DragOverlay>
          {dragState.isDragging && dragState.draggedEvent && (
            <div className="transform rotate-1 scale-105 pointer-events-none">
              <DraggableEvent
                event={dragState.draggedEvent}
                isDragging={true}
                className="shadow-lg border border-blue-400 bg-opacity-90"
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* 拖拽状态指示器 */}
      {dragState.isDragging && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">
              拖拽 "{dragState.draggedEvent?.title}" 到目标日期
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableMonthView; 