'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import EventModal from '../components/EventModal';
import EventList from '../components/EventList';
import { useEnhancedEvents } from '../hooks/useEnhancedEvents';
import { EventData } from '../services/eventTypeService';
import ImprovedEventModal from '../components/ImprovedEventModal';
import DraggableMonthView from '../components/DraggableMonthView';
// import WeekdayDebug from '../debug/WeekdayDebug'; // 调试完成，已移除
import CalendarSettings from '../components/CalendarSettings';
import type { CalendarSettings as CalendarSettingsType } from '../components/CalendarSettings';
import { AuthProvider, useAuth, UserMenu } from '@/modules/auth';
import { ArrowLeft, Calendar, Users, Clock, Settings, Lock, Shield, Sparkles, Zap } from 'lucide-react';

/**
 * 日历页面内容组件
 * 
 * 需要在AuthProvider包装器内使用，以便访问认证状态
 */
function CalendarPageContent() {
  const { isAuthenticated, user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>(CalendarViewType.MONTH);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'events' | 'settings'>('calendar');
  
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
    if (isAuthenticated) {
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
    }
  }, [currentDate, fetchEvents, isAuthenticated]);

  // 示例事件数据 - 当没有实际事件时显示
  const sampleEvents = useMemo(() => [
    { date: '2024-12-15', title: '团队会议', color: 'blue' },
    { date: '2024-12-20', title: '项目评审', color: 'green' },
    { date: '2024-12-25', title: '圣诞节', color: 'red' },
    { date: '2024-12-31', title: '年终总结', color: 'purple' },
  ], []);

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

  // 检查日期是否有事件（优先使用真实事件，其次使用示例事件）
  const getEventsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    
    // 首先查找真实事件
    const realEvents = events.filter(event => {
      const eventDateStr = formatDate(event.startTime);
      return eventDateStr === dateStr;
    });
    
    // 如果有真实事件，返回真实事件，否则返回示例事件
    if (realEvents.length > 0) {
      return realEvents.map(event => ({
        title: event.title,
        color: event.color,
        id: event.id,
        isRealEvent: true
      }));
    }
    
    // 为了演示效果，显示示例事件
    return sampleEvents.filter(event => event.date === dateStr).map(event => ({
      title: event.title,
      color: event.color,
      id: undefined,
      isRealEvent: false
    }));
  };

  // 获取事件颜色类名
  const getEventColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500',
      pink: 'bg-pink-500',
      indigo: 'bg-indigo-500',
      gray: 'bg-gray-500',
    };
    return colorMap[color] || 'bg-blue-500';
  };

  // 处理日期点击
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  // 处理事件点击
  const handleEventClick = (event: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };



  // 处理创建增强事件
  const handleCreateEnhancedEvent = async (eventData: EventData) => {
    try {
      console.log('📝 创建增强事件:', eventData);
      await createEnhancedEvent(eventData);
      setIsEventModalOpen(false);
      setEditingEvent(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('创建增强事件失败:', error);
    }
  };

  // 处理事件删除
  const handleEventDelete = async (eventId: number) => {
    try {
      await deleteEvent(eventId);
      setIsEventModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('删除事件失败:', error);
    }
  };

  // 处理批量删除
  const handleBatchDelete = async (eventIds: number[]) => {
    try {
      await batchDeleteEvents(eventIds);
    } catch (error) {
      console.error('批量删除失败:', error);
    }
  };

  // 处理事件列表点击
  const handleEventListClick = (event: any) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  // 处理事件列表编辑
  const handleEventListEdit = (event: any) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  // 处理事件列表配置变更
  const handleEventListConfigChange = (config: EventListConfig) => {
    setEventListConfig(config);
  };

  // 处理模态框关闭
  const handleModalClose = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setSelectedDate(null);
  };

  // 处理设置变更
  const handleSettingsChange = (newSettings: CalendarSettingsType) => {
    setCalendarSettings(newSettings);
  };

  // 未登录状态渲染 - Apple Design
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* 顶部导航栏 - 毛玻璃效果 */}
        <header className="backdrop-blur-xl bg-white/70 border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 px-4 py-3 rounded-full hover:bg-white/50 transition-all duration-200 backdrop-blur-sm"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline font-medium">返回</span>
              </button>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  日历管理
                </h1>
              </div>
              
              <UserMenu />
            </div>
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          {/* 功能特性展示 */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                智能日历管理系统
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                现代化的日历应用，提供完整的事件管理、智能提醒和多视图展示功能
              </p>
            </div>

            {/* 功能特性卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl shadow-slate-200/50 hover:scale-105 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">多视图展示</h3>
                <p className="text-slate-600 leading-relaxed">支持月视图、周视图、日视图和议程视图，满足不同场景的查看需求。</p>
              </div>

              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl shadow-slate-200/50 hover:scale-105 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 shadow-lg shadow-green-500/25">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">智能提醒</h3>
                <p className="text-slate-600 leading-relaxed">多种提醒方式和时间配置，确保重要事件不被遗漏。</p>
              </div>

              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl shadow-slate-200/50 hover:scale-105 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl mb-6 shadow-lg shadow-purple-500/25">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">协作共享</h3>
                <p className="text-slate-600 leading-relaxed">支持事件分享和团队协作，让团队日程管理更加高效。</p>
              </div>
            </div>
          </div>

          {/* 登录卡片 - 优雅的行动引导 */}
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-slate-200/50 p-12 text-center border border-white/30">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-8 shadow-xl shadow-blue-500/30">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">开启您的日历之旅</h3>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
              登录您的账户，解锁完整的日历管理功能，体验高效的时间管理。
            </p>
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-full shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300">
              <Lock size={20} />
              <span>点击右上角登录按钮开始</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          />
        );
    }
  };

  // 渲染月视图
  const renderMonthView = () => {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* 星期标题 */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {weekdays.map((day, index) => (
            <div
              key={index}
              className="px-3 py-2 text-sm font-medium text-gray-700 text-center"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-0">
          {monthDates.map((date, index) => {
            const dateEvents = getEventsForDate(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const todayClass = isToday(date) ? 'bg-blue-50 border-blue-200' : '';
            
            return (
              <div
                key={index}
                className={`
                  min-h-[120px] border-r border-b border-gray-200 p-2 cursor-pointer
                  hover:bg-gray-50 transition-colors duration-200
                  ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                  ${todayClass}
                `}
                onClick={() => handleDateClick(date)}
              >
                {/* 日期数字 */}
                <div className={`
                  text-sm font-medium mb-1
                  ${isToday(date) ? 'text-blue-600' : ''}
                  ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                `}>
                  {date.getDate()}
                </div>
                
                {/* 事件列表 */}
                <div className="space-y-1">
                  {dateEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`
                        px-2 py-1 rounded text-xs text-white truncate cursor-pointer
                        ${getEventColorClass(event.color)}
                        ${event.isRealEvent ? 'hover:opacity-80' : 'opacity-60'}
                      `}
                      onClick={(e) => event.isRealEvent && handleEventClick(event, e)}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dateEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{dateEvents.length - 3} 更多
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染周视图
  const renderWeekView = () => {
    const weekDates = getWeekViewDates(currentDate);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* 星期标题 */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {weekdays.map((day, index) => {
            const date = weekDates[index];
            const isCurrentDay = isToday(date);
            
            return (
              <div
                key={index}
                className={`
                  px-3 py-4 text-center border-r border-gray-200 last:border-r-0
                  ${isCurrentDay ? 'bg-blue-50 border-blue-200' : ''}
                `}
              >
                <div className="text-sm font-medium text-gray-700">{day}</div>
                <div className={`
                  text-lg font-semibold mt-1
                  ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}
                `}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 时间槽和事件 */}
        <div className="grid grid-cols-7 gap-0 min-h-[600px]">
          {weekDates.map((date, index) => {
            const dateEvents = getEventsForDate(date);
            const isCurrentDay = isToday(date);
            
            return (
              <div
                key={index}
                className={`
                  border-r border-gray-200 last:border-r-0 p-2 cursor-pointer
                  hover:bg-gray-50 transition-colors duration-200
                  ${isCurrentDay ? 'bg-blue-50/30' : ''}
                `}
                onClick={() => handleDateClick(date)}
              >
                {/* 事件列表 */}
                <div className="space-y-1">
                  {dateEvents.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`
                        px-2 py-1 rounded text-xs text-white truncate cursor-pointer
                        ${getEventColorClass(event.color)}
                        ${event.isRealEvent ? 'hover:opacity-80' : 'opacity-60'}
                      `}
                      onClick={(e) => event.isRealEvent && handleEventClick(event, e)}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染日视图
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* 日期标题 */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentDate.toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <p className="text-sm text-gray-600">
                {currentDate.toLocaleDateString('zh-CN', { weekday: 'long' })}
              </p>
            </div>
            <button
              onClick={() => handleDateClick(currentDate)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              添加事件
            </button>
          </div>
        </div>
        
        {/* 时间轴 */}
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="flex border-b border-gray-100 hover:bg-gray-50">
              <div className="w-16 px-3 py-2 text-sm text-gray-500 text-right border-r border-gray-200">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="flex-1 p-2 min-h-[60px] cursor-pointer">
                {/* 这里可以添加该时间段的事件 */}
              </div>
            </div>
          ))}
        </div>
        
        {/* 全天事件 */}
        {dayEvents.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">全天事件</h4>
            <div className="space-y-1">
              {dayEvents.map((event, index) => (
                <div
                  key={index}
                  className={`
                    px-3 py-2 rounded text-sm text-white cursor-pointer
                    ${getEventColorClass(event.color)}
                    ${event.isRealEvent ? 'hover:opacity-80' : 'opacity-60'}
                  `}
                  onClick={(e) => event.isRealEvent && handleEventClick(event, e)}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 已登录状态渲染
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline font-medium">返回</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">日历管理</h1>
              <p className="text-sm text-gray-600">
                欢迎回来，{user?.name || user?.phone}！
              </p>
            </div>
            
            <UserMenu />
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab导航 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'calendar', label: '日历视图', icon: Calendar },
                { id: 'events', label: '事件列表', icon: Users },
                { id: 'settings', label: '设置', icon: Settings }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 日历Tab */}
        {activeTab === 'calendar' && (
          <>
            {/* 日历控制栏 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                {/* 导航控制 */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPrevious}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  
                  <h2 className="text-lg font-semibold text-gray-900 min-w-[200px]">
                    {getViewTitle()}
                  </h2>
                  
                  <button
                    onClick={goToNext}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ArrowLeft size={20} className="rotate-180" />
                  </button>
                  
                  <button
                    onClick={goToToday}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    今天
                  </button>
                </div>
                
                {/* 视图切换 */}
                <div className="flex items-center gap-2">
                  {[
                    { type: CalendarViewType.MONTH, label: '月' },
                    { type: CalendarViewType.WEEK, label: '周' },
                    { type: CalendarViewType.DAY, label: '日' }
                  ].map(({ type, label }) => (
                    <button
                      key={type}
                      onClick={() => setViewType(type)}
                      className={`
                        px-3 py-2 text-sm rounded-lg transition-colors duration-200
                        ${viewType === type
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <p className="text-red-800">{error}</p>
                  <button 
                    onClick={clearError}
                    className="text-red-600 hover:bg-red-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* 加载状态 */}
            {loading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">加载中...</span>
                </div>
              </div>
            )}

            {/* 日历视图 */}
            {!loading && renderCalendarView()}

            {/* 功能说明 */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 功能说明</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div className="flex items-center text-sm text-blue-700">
                  <svg className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  多视图支持（月/周/日）
                </div>
                <div className="flex items-center text-sm text-blue-700">
                  <svg className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  智能事件管理
                </div>
                <div className="flex items-center text-sm text-blue-700">
                  <svg className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  重复事件支持
                </div>
                <div className="flex items-center text-sm text-blue-700">
                  <svg className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  拖拽事件管理
                </div>
                <div className="flex items-center text-sm text-blue-700">
                  <svg className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  响应式设计
                </div>
                <div className="flex items-center text-sm text-blue-700">
                  <svg className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  数据库持久化
                </div>
              </div>
            </div>
          </>
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
      </main>

      {/* 事件创建/编辑模态框 */}
      <ImprovedEventModal
        isOpen={isEventModalOpen}
        onClose={handleModalClose}
        onSave={handleCreateEnhancedEvent}
        onDelete={editingEvent ? handleEventDelete : undefined}
        event={editingEvent}
        initialDate={selectedDate || undefined}
      />
    </div>
  );
}

/**
 * 日历页面主组件（带认证包装器）
 * 
 * 这是对外导出的主组件，包装了AuthProvider以提供认证上下文
 */
export default function CalendarPage() {
  return (
    <AuthProvider>
      <CalendarPageContent />
    </AuthProvider>
  );
} 