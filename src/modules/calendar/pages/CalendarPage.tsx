'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth, UserMenu, LoginModal } from 'sa2kit/auth/legacy';
import { Settings, Calculator } from 'lucide-react';
import { DateCalculatorTool } from '@/modules/dateCalculator';
import { 
  CalendarViewType, 
  EventColor,
  EventFormData,
  CreateEventRequest,
  UpdateEventRequest,
  EventListDisplayMode,
  EventSortField,
  SortDirection,
  EventPriority,
  EventListConfig,
  formatDate,
  getMonthViewDates,
  getWeekViewDates,
  isToday,
  isSameMonth,
  isSameWeek,
  addDays,
  addWeeks,
  useEvents,
  getWeekdayName
} from '../index';
import EventList from '../components/EventList';
import { useEnhancedEvents } from '../hooks/useEnhancedEvents';
import { EventData } from '../services/eventTypeService';
import ImprovedEventModal from '../components/ImprovedEventModal';
import DraggableMonthView from '../components/DraggableMonthView';
// import WeekdayDebug from '../debug/WeekdayDebug'; // 调试完成，已移除
import CalendarSettings from '../components/CalendarSettings';
import type { CalendarSettings as CalendarSettingsType } from '../components/CalendarSettings';

/**
 * 基础日历页面组件
 * 
 * 这是一个简化版本的日历页面，用于在实验田中展示基本功能
 * 包含了基本的月历视图和事件显示
 */
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>(CalendarViewType.MONTH);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    'calendar' | 'events' | 'tools' | 'settings'
  >('calendar');
  
  // 登录相关状态
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // 使用认证上下文
  const { user, isAuthenticated, logout } = useAuth();
  
  // 日历设置状态
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettingsType | null>(null);
  
  // 事件列表配置
  const [eventListConfig, setEventListConfig] = useState<EventListConfig>({
    displayMode: EventListDisplayMode.LIST,
    sort: {
      field: EventSortField.START_TIME,
      direction: SortDirection.ASC
    },
    filter: {},
    pageSize: 10,
    currentPage: 1
  });
  
  // 使用事件管理Hook
  const { 
    events, 
    loading, 
    error, 
    createEvent, 
    createEnhancedEvent,
    updateEvent,
    updateEventTime,
    deleteEvent,
    batchDeleteEvents,
    fetchEvents, 
    clearError 
  } = useEnhancedEvents();

  // 获取当前月份的日期数组
  const monthDates = useMemo(() => getMonthViewDates(currentDate), [currentDate]);

  // 加载当前月份的事件（包含月视图中显示的相邻月份日期）
  useEffect(() => {
    // 获取月视图显示的所有日期范围（包括上月末和下月初）
    const viewDates = getMonthViewDates(currentDate);
    const viewStart = viewDates[0]; // 第一个日期
    const viewEnd = viewDates[viewDates.length - 1]; // 最后一个日期
    
    console.log('📅 加载月视图事件范围:', {
      currentMonth: `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`,
      viewStart: formatDate(viewStart),
      viewEnd: formatDate(viewEnd),
      totalDays: viewDates.length
    });
    
    fetchEvents(viewStart, viewEnd).catch(err => {
      console.error('加载事件失败:', err);
    });
  }, [currentDate, fetchEvents]);

  // 向前导航
  const goToPrevious = () => {
    switch (viewType) {
      case CalendarViewType.MONTH:
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        break;
      case CalendarViewType.WEEK:
        setCurrentDate(addDays(currentDate, -7));
        break;
      case CalendarViewType.DAY:
        setCurrentDate(addDays(currentDate, -1));
        break;
    }
  };

  // 向后导航
  const goToNext = () => {
    switch (viewType) {
      case CalendarViewType.MONTH:
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        break;
      case CalendarViewType.WEEK:
        setCurrentDate(addDays(currentDate, 7));
        break;
      case CalendarViewType.DAY:
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  };

  // 切换到今天
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 获取月份名称
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
  };

  // 获取视图标题
  const getViewTitle = () => {
    switch (viewType) {
      case CalendarViewType.MONTH:
        return getMonthName(currentDate);
      case CalendarViewType.WEEK:
        const weekStart = getWeekViewDates(currentDate)[0];
        const weekEnd = getWeekViewDates(currentDate)[6];
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月 第${Math.ceil(weekStart.getDate() / 7)}周`;
        } else {
          return `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`;
        }
      case CalendarViewType.DAY:
        return currentDate.toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        });
      default:
        return getMonthName(currentDate);
    }
  };

  // 注意：getWeekdayNames 函数已移除，现在直接基于实际日期获取星期名称

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return events
      .filter((event) => formatDate(event.startTime) === dateStr)
      .map((event) => ({
        title: event.title,
        color: event.color,
        id: event.id,
        isRealEvent: true as const,
      }));
  };

  // 获取事件颜色类名
  const getEventColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      '#3B82F6': 'bg-blue-100 text-blue-800 border-blue-200',
      '#10B981': 'bg-green-100 text-green-800 border-green-200',
      '#EF4444': 'bg-red-100 text-red-800 border-red-200',
      '#8B5CF6': 'bg-purple-100 text-purple-800 border-purple-200',
      '#F59E0B': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // 处理日期点击事件
  const handleDateClick = (date: Date) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    setSelectedDate(date);
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  // 处理事件点击（用于编辑）
  const handleEventClick = (event: any, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡到日期点击
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    setEditingEvent(event);
    setSelectedDate(null);
    setIsEventModalOpen(true);
  };

  // 处理事件保存（创建或更新）
  const handleEventSave = async (eventData: CreateEventRequest | UpdateEventRequest) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    
    try {
      // 确保必需字段存在
      if (!eventData.title || !eventData.startTime || !eventData.endTime) {
        throw new Error('缺少必需的事件信息');
      }
      
      if (editingEvent) {
        // 更新现有事件
        await updateEvent(editingEvent.id, {
          title: eventData.title,
          description: eventData.description,
          startTime: new Date(eventData.startTime),
          endTime: new Date(eventData.endTime),
          allDay: eventData.allDay || false,
          location: eventData.location,
          color: eventData.color || EventColor.BLUE,
          priority: eventData.priority || EventPriority.NORMAL,
        });
      } else {
        // 创建新事件
        await createEvent({
          title: eventData.title,
          description: eventData.description,
          startTime: new Date(eventData.startTime),
          endTime: new Date(eventData.endTime),
          allDay: eventData.allDay || false,
          location: eventData.location,
          color: eventData.color || EventColor.BLUE,
          priority: eventData.priority || EventPriority.NORMAL,
        });
      }
      
      setIsEventModalOpen(false);
      setSelectedDate(null);
      setEditingEvent(null);
    } catch (error) {
      console.error(editingEvent ? '更新事件失败:' : '创建事件失败:', error);
      // 可以在这里显示错误提示
    }
  };

  // 处理事件删除
  const handleEventDelete = async (eventId: number) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    
    try {
      await deleteEvent(eventId);
      setIsEventModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('删除事件失败:', error);
    }
  };

  // 处理批量删除事件
  const handleBatchDelete = async (eventIds: number[]) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    
    try {
      await batchDeleteEvents(eventIds);
    } catch (error) {
      console.error('批量删除事件失败:', error);
      throw error; // 重新抛出错误，让EventList组件处理
    }
  };

  // 处理事件列表中的事件点击
  const handleEventListClick = (event: any) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  // 处理事件列表中的事件编辑
  const handleEventListEdit = (event: any) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  // 处理事件列表配置变更
  const handleEventListConfigChange = (config: EventListConfig) => {
    setEventListConfig(config);
  };

  // 关闭模态框
  const handleModalClose = () => {
    setIsEventModalOpen(false);
    setSelectedDate(null);
    setEditingEvent(null);
    clearError();
  };

  // 处理设置变更
  const handleSettingsChange = (newSettings: CalendarSettingsType) => {
    setCalendarSettings(newSettings);
    console.log('📝 日历设置已更新:', newSettings);
    // 这里可以应用设置到日历显示
  };

  // 登录相关处理函数
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    console.log('用户登录成功');
  };

  const handleLoginClose = () => {
    setIsLoginModalOpen(false);
  };

  const handleShowLogin = () => {
    setIsLoginModalOpen(true);
  };

  // 渲染不同的日历视图
  const renderCalendarView = () => {
    switch (viewType) {
      case CalendarViewType.MONTH:
        return (
          <DraggableMonthView
            events={events}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onEventClick={(event) => {
              setEditingEvent(event);
              setIsEventModalOpen(true);
            }}
            onDateClick={handleDateClick}
            onEventUpdate={updateEventTime}
            className="border border-white/80 bg-white/80 shadow-xl shadow-indigo-950/5 backdrop-blur-md"
          />
        );
      case CalendarViewType.WEEK:
        return renderWeekView();
      case CalendarViewType.DAY:
        return renderDayView();
      default:
        return (
          <DraggableMonthView
            events={events}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onEventClick={(event) => {
              setEditingEvent(event);
              setIsEventModalOpen(true);
            }}
            onDateClick={handleDateClick}
            onEventUpdate={updateEventTime}
            className="border border-white/80 bg-white/80 shadow-xl shadow-indigo-950/5 backdrop-blur-md"
          />
        );
    }
  };

  // 渲染月视图
  const renderMonthView = () => {
    return (
      <div className="mb-6 overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-xl shadow-indigo-950/5 backdrop-blur-md">
        {/* 使用表格布局确保正确的行列对齐 */}
        <table className="w-full table-fixed">
          {/* 星期标题 */}
          <thead>
            <tr className="bg-slate-50/90">
              {monthDates.slice(0, 7).map((date, index) => {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                return (
                  <th 
                    key={index} 
                    className={`p-3 text-center text-sm font-semibold border-b border-gray-200 ${
                      index < 6 ? 'border-r border-gray-200' : ''
                    } ${
                      isWeekend ? 'text-red-600' : 'text-gray-700'
                    }`}
                  >
                    {getWeekdayName(date, 'zh-CN', 'short')}
                  </th>
                );
              })}
            </tr>
          </thead>
          
          {/* 日期网格 */}
          <tbody>
            {Array.from({ length: 6 }, (_, weekIndex) => (
              <tr key={weekIndex}>
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dateIndex = weekIndex * 7 + dayIndex;
                  const date = monthDates[dateIndex];
                  
                  if (!date) return <td key={dayIndex} className="h-24 border-b border-gray-200"></td>;
                  
                  const isCurrentMonth = isSameMonth(date, currentDate);
                  const isTodayDate = isToday(date);
                  const dayEvents = getEventsForDate(date);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  return (
                    <td
                      key={dayIndex}
                      onClick={() => isCurrentMonth && handleDateClick(date)}
                      className={`
                        h-24 border-b border-gray-200 relative
                        ${dayIndex < 6 ? 'border-r border-gray-200' : ''}
                        hover:bg-gray-50 transition-colors
                        ${isCurrentMonth ? 'cursor-pointer' : 'cursor-default'}
                        ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
                        ${isTodayDate ? 'bg-blue-50' : ''}
                      `}
                    >
                      <div className="h-full flex flex-col items-center p-2">
                        {/* 日期数字 */}
                        <div className="flex justify-center mb-2">
                          <span
                            className={`
                              inline-flex items-center justify-center text-sm font-medium w-6 h-6
                              ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                              ${isWeekend && isCurrentMonth ? 'text-red-600' : ''}
                              ${isTodayDate ? 'bg-blue-600 text-white rounded-full' : ''}
                            `}
                          >
                            {date.getDate()}
                          </span>
                        </div>
                        
                        {/* 事件列表 */}
                        {isCurrentMonth && dayEvents.length > 0 && (
                          <div className="space-y-1 px-1">
                            {dayEvents.slice(0, 2).map((event, eventIndex) => (
                              <div
                                key={eventIndex}
                                onClick={(e) => event.isRealEvent && event.id ? handleEventClick(events.find(e => e.id === event.id), e) : undefined}
                                className={`
                                  text-xs px-1 py-0.5 rounded text-center font-medium truncate
                                  ${event.isRealEvent ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                                  transition-opacity
                                  ${getEventColorClass(event.color)}
                                `}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{dayEvents.length - 2} 更多
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 渲染周视图
  const renderWeekView = () => {
    const weekDates = getWeekViewDates(currentDate);
    
    return (
      <div className="mb-6 overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-xl shadow-indigo-950/5 backdrop-blur-md">
        <table className="w-full table-fixed">
          {/* 星期标题 */}
          <thead>
            <tr className="bg-slate-50/90">
              {weekDates.map((date, index) => {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                
                return (
                  <th 
                    key={index} 
                    className={`p-3 text-center border-b border-gray-200 ${
                      index < 6 ? 'border-r border-gray-200' : ''
                    }`}
                  >
                    <div className={`text-sm font-medium ${
                      isWeekend ? 'text-red-600' : 'text-gray-700'
                    }`}>
                      {getWeekdayName(date, 'zh-CN', 'short')}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          
          {/* 日期网格 */}
          <tbody>
            <tr>
              {weekDates.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isTodayDate = isToday(date);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                
                return (
                  <td
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`
                      h-56 border-b border-gray-200 relative cursor-pointer
                      ${index < 6 ? 'border-r border-gray-200' : ''}
                      hover:bg-gray-50 transition-colors
                      ${isTodayDate ? 'bg-blue-50' : 'bg-white'}
                    `}
                  >
                    <div className="flex flex-col h-full p-3">
                      {/* 日期显示区域 - 居中对齐 */}
                      <div className="flex flex-col items-center mb-3">
                        <div className={`flex items-center justify-center text-lg font-bold w-10 h-10 rounded-full ${
                          isTodayDate ? 'bg-blue-600 text-white shadow-md' : 
                          isWeekend ? 'text-red-600 bg-red-50' : 'text-gray-900 hover:bg-gray-100'
                        } transition-colors`}>
                          {date.getDate()}
                        </div>
                        {/* 月份信息（仅在月份变化时显示） */}
                        {(index === 0 || date.getDate() === 1) && (
                          <div className="text-xs text-gray-500 mt-1 font-medium">
                            {date.getMonth() + 1}月
                          </div>
                        )}
                      </div>
                      
                      {/* 事件统计和列表 */}
                      <div className="flex-1 flex flex-col">
                        {dayEvents.length > 0 ? (
                          <>
                            {/* 事件数量标识 - 居中显示 */}
                            <div className="text-center mb-2">
                              <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                                dayEvents.length > 5 ? 'bg-red-100 text-red-700' :
                                dayEvents.length > 2 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {dayEvents.length}
                              </span>
                            </div>
                            
                            {/* 事件列表 */}
                            <div className="space-y-1 overflow-hidden">
                              {dayEvents.slice(0, 4).map((event, eventIndex) => (
                                <div
                                  key={eventIndex}
                                  onClick={(e) => event.isRealEvent && event.id ? handleEventClick(events.find(e => e.id === event.id), e) : undefined}
                                  className={`
                                    text-xs px-2 py-1 rounded font-medium truncate text-center
                                    ${event.isRealEvent ? 'cursor-pointer hover:opacity-80 hover:shadow-sm' : 'cursor-default'}
                                    transition-all duration-200
                                    ${getEventColorClass(event.color)}
                                  `}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 4 && (
                                <div className="text-xs text-gray-500 text-center py-1 bg-gray-100 rounded">
                                  +{dayEvents.length - 4} 更多
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          /* 无事件时的占位符 */
                          <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-4 h-4 mx-auto mb-1 opacity-30">
                                <svg fill="currentColor" viewBox="0 0 20 20" className="text-gray-400">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="text-xs text-gray-400">无事件</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // 渲染日视图
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const isTodayDate = isToday(currentDate);
    
    return (
      <div className="mb-6 overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-xl shadow-indigo-950/5 backdrop-blur-md">
        {/* 日期标题 */}
        <div className="border-b border-slate-200/80 bg-slate-50/90 p-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">
              {currentDate.toLocaleDateString('zh-CN', { weekday: 'long' })}
            </div>
            <div className={`text-2xl font-bold ${
              isTodayDate ? 'text-blue-600' : 'text-gray-900'
            }`}>
              {currentDate.getDate()}日
            </div>
            <div className="text-sm text-gray-600">
              {currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>

        {/* 时间槽和事件 */}
        <div className="p-4">
          {/* 创建事件按钮 */}
          <button
            onClick={() => handleDateClick(currentDate)}
            className="w-full mb-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            + 在此日期创建事件
          </button>

          {/* 事件列表 */}
          {dayEvents.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                今日事件 ({dayEvents.length})
              </h3>
              {dayEvents.map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  onClick={(e) => event.isRealEvent && event.id ? handleEventClick(events.find(e => e.id === event.id), e) : undefined}
                  className={`
                    p-3 rounded-lg border-l-4 bg-gray-50
                    ${event.isRealEvent ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}
                    transition-shadow
                    ${getEventColorClass(event.color)}
                  `}
                >
                  <div className="font-medium text-sm mb-1">{event.title}</div>
                  {event.isRealEvent && event.id && (
                    <div className="text-xs text-gray-600">
                      点击编辑事件
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>今日暂无事件</p>
              <p className="text-xs mt-1">点击上方按钮创建事件</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 处理增强事件创建
  const handleCreateEnhancedEvent = useCallback(async (eventData: EventData) => {
    try {
      const createdEvents = await createEnhancedEvent(eventData);
      setIsEventModalOpen(false);
      setSelectedDate(null);
      
      // 显示成功消息
      const eventCount = createdEvents.length;
      if (eventCount > 1) {
        alert(`成功创建 ${eventCount} 个事件！`);
      } else {
        alert('事件创建成功！');
      }
    } catch (error) {
      console.error('创建增强事件失败:', error);
      alert('创建事件失败，请重试');
    }
  }, [createEnhancedEvent]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-stone-50 via-violet-50/35 to-indigo-100/55">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.2) 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
        <div className="mb-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-violet-600/85">
                Pencil · Studio
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                日历
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                月 / 周 / 日视图与事件列表、设置、日期工具（间隔与推算）统一在同一套柔和卡片界面中。
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <UserMenu
                  customMenuItems={[
                    {
                      id: 'settings',
                      label: '个人设置',
                      icon: Settings,
                      onClick: () => setActiveTab('settings'),
                    },
                  ]}
                />
              ) : (
                <button
                  type="button"
                  onClick={handleShowLogin}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-violet-500/25 transition hover:bg-violet-700"
                >
                  登录
                </button>
              )}
            </div>
          </div>

          <div
            className="inline-flex w-full flex-wrap gap-1 rounded-2xl border border-white/70 bg-white/55 p-1 shadow-sm backdrop-blur-md sm:w-auto"
            role="tablist"
            aria-label="日历模块主导航"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'calendar'}
              onClick={() => setActiveTab('calendar')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition sm:flex-none sm:px-4 ${
                activeTab === 'calendar'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                  : 'text-slate-600 hover:bg-white/70'
              }`}
            >
              日历视图
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'events'}
              onClick={() => setActiveTab('events')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition sm:flex-none sm:px-4 ${
                activeTab === 'events'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                  : 'text-slate-600 hover:bg-white/70'
              }`}
            >
              事件列表
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'tools'}
              onClick={() => setActiveTab('tools')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition sm:flex-none sm:px-4 ${
                activeTab === 'tools'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                  : 'text-slate-600 hover:bg-white/70'
              }`}
            >
              <Calculator className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              日期工具
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition sm:flex-none sm:px-4 ${
                activeTab === 'settings'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                  : 'text-slate-600 hover:bg-white/70'
              }`}
            >
              设置
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200/80 bg-red-50/90 p-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="mt-0.5 h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">操作失败</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button
                  type="button"
                  onClick={clearError}
                  className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab内容区域 */}
        {activeTab === 'calendar' && (
          <>
            <div className="mb-6 rounded-2xl border border-violet-100/90 bg-gradient-to-r from-violet-50/90 to-indigo-50/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="mt-0.5 h-5 w-5 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-violet-900">使用说明</h3>
                  <p className="mt-1 text-sm leading-relaxed text-violet-900/80">
                    点击日期创建事件；月视图支持在桌面端拖拽调整时间。
                    {!isAuthenticated && (
                      <span className="mt-2 block font-medium text-amber-800">
                        请先登录以保存事件。
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-3xl border border-white/80 bg-white/75 p-4 shadow-xl shadow-indigo-950/5 backdrop-blur-md sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="rounded-xl border border-slate-200/80 bg-white p-2 text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700"
                    aria-label="向前"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="min-w-[10rem] text-center text-lg font-semibold text-slate-900 sm:text-xl">
                    {getViewTitle()}
                  </h2>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="rounded-xl border border-slate-200/80 bg-white p-2 text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700"
                    aria-label="向后"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={goToToday}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-700"
                  >
                    今天
                  </button>
                  <div className="inline-flex rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1">
                    {(['month', 'week', 'day'] as const).map((view) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() =>
                          setViewType(
                            CalendarViewType[view.toUpperCase() as keyof typeof CalendarViewType]
                          )
                        }
                        className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                          viewType ===
                          CalendarViewType[view.toUpperCase() as keyof typeof CalendarViewType]
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {view === 'month' ? '月' : view === 'week' ? '周' : '日'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {renderCalendarView()}
          </>
        )}

      {activeTab === 'tools' && (
        <div className="rounded-3xl border border-white/80 bg-white/75 p-4 shadow-xl shadow-indigo-950/5 backdrop-blur-md sm:p-6">
          <DateCalculatorTool variant="embedded" />
        </div>
      )}

      {/* 事件列表Tab */}
      {activeTab === 'events' && (
        <EventList
          events={events}
          config={eventListConfig}
          onConfigChange={handleEventListConfigChange}
          onEventClick={handleEventListClick}
          onEventEdit={handleEventListEdit}
          onEventDelete={handleEventDelete}
          onBatchDelete={handleBatchDelete}
          enableBatchActions={true}
          loading={loading}
        />
      )}

      {/* 设置Tab */}
      {activeTab === 'settings' && (
        <CalendarSettings
          onSettingsChange={handleSettingsChange}
        />
      )}
      </div>

      {/* 事件创建/编辑模态框 */}
      <ImprovedEventModal
        isOpen={isEventModalOpen}
        onClose={handleModalClose}
        onSave={handleCreateEnhancedEvent}
        onDelete={editingEvent ? handleEventDelete : undefined}
        event={editingEvent}
        initialDate={selectedDate || undefined}
      />

      {/* 登录模态框 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginClose}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
} 