'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth, UserMenu, LoginModal } from 'sa2kit/auth/legacy';
import { Settings, Calculator, Plus } from 'lucide-react';
import { ConfirmModal } from 'sa2kit/components';
import { DateCalculatorTool } from '@/modules/dateCalculator';
import {
  CalendarViewType,
  EventListDisplayMode,
  EventSortField,
  SortDirection,
  EventPriority,
  EventListConfig,
  getMonthViewDates,
  getWeekViewDates,
  addDays,
  useEnhancedEvents,
} from '../index';
import EventList from '../components/EventList';
import ImprovedEventModal from '../components/ImprovedEventModal';
import DraggableMonthView from '../components/DraggableMonthView';
import CalendarSettings from '../components/CalendarSettings';
import CalendarToolbar from '../components/CalendarToolbar';
import CalendarWeekView from '../components/CalendarWeekView';
import CalendarDayView from '../components/CalendarDayView';
import DayEventsSheet from '../components/DayEventsSheet';
import CalendarToast from '../components/CalendarToast';
import type { CalendarSettings as CalendarSettingsType } from '../components/CalendarSettings';
import { EventData, EventType } from '../services/eventTypeService';
import { useDeviceType } from '../utils/deviceUtils';
import { mapStringToEventPriority } from '../utils/eventDisplay';
import type { CalendarEvent } from '../types';

type MainTab = 'calendar' | 'events' | 'tools' | 'settings';

function getViewTitle(viewType: CalendarViewType, currentDate: Date): string {
  switch (viewType) {
    case CalendarViewType.MONTH:
      return currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
    case CalendarViewType.WEEK: {
      const [weekStart, weekEnd] = [
        getWeekViewDates(currentDate)[0],
        getWeekViewDates(currentDate)[6],
      ];
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月`;
      }
      return `${weekStart.getMonth() + 1}/${weekStart.getDate()} – ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
    }
    case CalendarViewType.DAY:
      return currentDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    default:
      return '';
  }
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>(CalendarViewType.MONTH);
  const [activeTab, setActiveTab] = useState<MainTab>('calendar');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [dayPanelDate, setDayPanelDate] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(
    null
  );
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [, setCalendarSettings] = useState<CalendarSettingsType | null>(null);

  const { isMobile } = useDeviceType();
  const { isAuthenticated } = useAuth();

  const [eventListConfig, setEventListConfig] = useState<EventListConfig>({
    displayMode: EventListDisplayMode.LIST,
    sort: { field: EventSortField.START_TIME, direction: SortDirection.ASC },
    filter: {},
    pageSize: 10,
    currentPage: 1,
  });

  const {
    events,
    loading,
    error,
    createEnhancedEvent,
    updateEvent,
    updateEventTime,
    deleteEvent,
    batchDeleteEvents,
    fetchEvents,
    clearError,
  } = useEnhancedEvents();

  const showToast = useCallback((message: string, variant: 'success' | 'error' = 'success') => {
    setToast({ message, variant });
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const requireAuth = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const loadRangeForView = useCallback(() => {
    let start: Date;
    let end: Date;
    if (viewType === CalendarViewType.MONTH) {
      const dates = getMonthViewDates(currentDate);
      start = dates[0];
      end = dates[dates.length - 1];
    } else if (viewType === CalendarViewType.WEEK) {
      const dates = getWeekViewDates(currentDate);
      start = dates[0];
      end = dates[6];
    } else {
      start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);
    }
    fetchEvents(start, end).catch(() => {});
  }, [currentDate, viewType, fetchEvents]);

  useEffect(() => {
    loadRangeForView();
  }, [loadRangeForView]);

  const viewTitle = useMemo(
    () => getViewTitle(viewType, currentDate),
    [viewType, currentDate]
  );

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

  const openCreateModal = useCallback(
    (date: Date) => {
      if (!isAuthenticated) {
        requireAuth();
        return;
      }
      setEditingEvent(null);
      setSelectedDate(date);
      setIsEventModalOpen(true);
      setDayPanelDate(null);
    },
    [isAuthenticated, requireAuth]
  );

  const openEditModal = useCallback(
    (event: CalendarEvent) => {
      if (!isAuthenticated) {
        requireAuth();
        return;
      }
      setEditingEvent(event);
      setSelectedDate(null);
      setIsEventModalOpen(true);
      setDayPanelDate(null);
    },
    [isAuthenticated, requireAuth]
  );

  const handleDateClick = useCallback(
    (date: Date) => {
      if (isMobile) {
        setDayPanelDate(date);
        return;
      }
      openCreateModal(date);
    },
    [isMobile, openCreateModal]
  );

  const handleEventSave = useCallback(
    async (eventData: EventData) => {
      if (!isAuthenticated) {
        requireAuth();
        return;
      }
      try {
        if (editingEvent) {
          if (eventData.type !== EventType.SINGLE) {
            showToast('编辑时仅支持修改当前活动实例（单次活动）', 'error');
            return;
          }
          await updateEvent(editingEvent.id, {
            title: eventData.title,
            description: eventData.description,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            allDay: eventData.allDay,
            location: eventData.location,
            color: eventData.color,
            priority: mapStringToEventPriority(eventData.priority),
          });
          showToast('活动已更新');
        } else {
          const created = await createEnhancedEvent(eventData);
          showToast(
            created.length > 1 ? `已创建 ${created.length} 个活动` : '活动已创建'
          );
        }
        setIsEventModalOpen(false);
        setEditingEvent(null);
        setSelectedDate(null);
        loadRangeForView();
      } catch {
        showToast('保存失败，请重试', 'error');
      }
    },
    [
      isAuthenticated,
      editingEvent,
      updateEvent,
      createEnhancedEvent,
      showToast,
      requireAuth,
      loadRangeForView,
    ]
  );

  const confirmDelete = useCallback(
    async (eventId: number) => {
      try {
        await deleteEvent(eventId);
        setDeleteTargetId(null);
        setIsEventModalOpen(false);
        setEditingEvent(null);
        setDayPanelDate(null);
        showToast('活动已删除');
        loadRangeForView();
      } catch {
        showToast('删除失败', 'error');
      }
    },
    [deleteEvent, showToast, loadRangeForView]
  );

  const handleModalClose = () => {
    setIsEventModalOpen(false);
    setSelectedDate(null);
    setEditingEvent(null);
    clearError();
  };

  const renderCalendarView = () => {
    switch (viewType) {
      case CalendarViewType.MONTH:
        return (
          <DraggableMonthView
            events={events}
            currentDate={currentDate}
            onEventClick={openEditModal}
            onDateClick={handleDateClick}
            onShowDayEvents={setDayPanelDate}
            onEventUpdate={updateEventTime}
          />
        );
      case CalendarViewType.WEEK:
        return (
          <CalendarWeekView
            currentDate={currentDate}
            events={events}
            onDateClick={handleDateClick}
            onEventClick={openEditModal}
            onShowDayEvents={setDayPanelDate}
          />
        );
      case CalendarViewType.DAY:
        return (
          <CalendarDayView
            currentDate={currentDate}
            events={events}
            onCreate={() => openCreateModal(currentDate)}
            onEventClick={openEditModal}
          />
        );
      default:
        return null;
    }
  };

  const tabs: { id: MainTab; label: string; icon?: React.ReactNode }[] = [
    { id: 'calendar', label: '日历' },
    { id: 'events', label: '全部活动' },
    { id: 'tools', label: '日期工具', icon: <Calculator className="h-4 w-4 shrink-0" aria-hidden /> },
    { id: 'settings', label: '设置' },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-violet-50/30 to-slate-100/80">
      <div className="relative mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600/90">
              实验田
            </p>
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              日历
            </h1>
            <p className="mt-1 max-w-xl text-pretty text-sm text-slate-600">
              月 / 周 / 日视图管理活动；移动端点击日期可查看并编辑当日全部安排。
            </p>
          </div>
          <div className="flex items-center gap-2">
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
                onClick={() => setIsLoginModalOpen(true)}
                className="h-10 rounded-xl bg-violet-600 px-4 text-sm font-medium text-white shadow-sm transition-transform hover:bg-violet-700 active:scale-[0.96]"
              >
                登录
              </button>
            )}
          </div>
        </header>

        <nav
          className="mb-6 inline-flex w-full gap-1 rounded-2xl bg-white/80 p-1 shadow-sm sm:w-auto"
          role="tablist"
          aria-label="日历模块导航"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-[background-color,color,box-shadow] sm:flex-none sm:px-4 ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="shrink-0 font-medium text-red-600 hover:text-red-800"
            >
              关闭
            </button>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4">
            {!isAuthenticated && (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200/80">
                登录后可创建与保存活动。
              </p>
            )}
            <CalendarToolbar
              title={viewTitle}
              viewType={viewType}
              onPrevious={goToPrevious}
              onNext={goToNext}
              onToday={() => setCurrentDate(new Date())}
              onViewTypeChange={setViewType}
            />
            {loading && events.length === 0 ? (
              <div className="flex justify-center py-16">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent"
                  aria-label="加载中"
                />
              </div>
            ) : (
              renderCalendarView()
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <EventList
            events={events}
            config={eventListConfig}
            onConfigChange={setEventListConfig}
            onEventClick={openEditModal}
            onEventEdit={openEditModal}
            onEventDelete={(id) => setDeleteTargetId(id)}
            onBatchDelete={batchDeleteEvents}
            enableBatchActions
            loading={loading}
          />
        )}

        {activeTab === 'tools' && (
          <div className="rounded-2xl bg-white/90 p-4 shadow-sm sm:p-6">
            <DateCalculatorTool variant="embedded" />
          </div>
        )}

        {activeTab === 'settings' && (
          <CalendarSettings onSettingsChange={setCalendarSettings} />
        )}
      </div>

      {activeTab === 'calendar' && isAuthenticated && (
        <button
          type="button"
          onClick={() => openCreateModal(currentDate)}
          className="fixed bottom-6 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-500/30 transition-transform hover:bg-violet-700 active:scale-[0.96] sm:bottom-8 sm:right-8"
          aria-label="新建活动"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <DayEventsSheet
        date={dayPanelDate}
        events={events}
        isOpen={dayPanelDate !== null}
        onClose={() => setDayPanelDate(null)}
        onCreate={openCreateModal}
        onEdit={openEditModal}
        onDelete={(id) => setDeleteTargetId(id)}
        isAuthenticated={isAuthenticated}
        onRequireLogin={requireAuth}
      />

      <ImprovedEventModal
        isOpen={isEventModalOpen}
        onClose={handleModalClose}
        onSave={handleEventSave}
        onDelete={editingEvent ? () => setDeleteTargetId(editingEvent.id) : undefined}
        event={editingEvent}
        initialDate={selectedDate ?? undefined}
        isMobile={isMobile}
      />

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => deleteTargetId && confirmDelete(deleteTargetId)}
        title="删除活动"
        message="确定删除此活动？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          showToast('登录成功');
        }}
      />

      <CalendarToast message={toast?.message ?? null} variant={toast?.variant} />
    </div>
  );
}
