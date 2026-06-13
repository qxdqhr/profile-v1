'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthProvider, useAuthContext, LoginRegisterModals } from '@/lib/auth';
import { Plus } from 'lucide-react';
import { ConfirmModal } from 'sa2kit/common/components';
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
import CalendarHeaderNav, { type CalendarMainTab } from '../components/CalendarHeaderNav';
import {
  CalendarSettingsProvider,
  useCalendarSettings,
} from '../context/CalendarSettingsContext';
import { AiApiSettingsProvider } from '@/modules/aiApi';
import {
  getThemeCssProperties,
  formatViewTitleDay,
  formatViewTitleMonth,
  type CalendarSettings,
} from '../utils/calendarSettingsCore';
import { EventData, EventType } from '../services/eventTypeService';
import { useDeviceType } from '../utils/deviceUtils';
import { mapStringToEventPriority } from '../utils/eventDisplay';
import type { CalendarEvent } from '../types';

function getViewTitle(
  viewType: CalendarViewType,
  currentDate: Date,
  settings: CalendarSettings
): string {
  switch (viewType) {
    case CalendarViewType.MONTH:
      return formatViewTitleMonth(currentDate, settings);
    case CalendarViewType.WEEK: {
      const weekDates = getWeekViewDates(currentDate, settings.weekStartsOn);
      const weekStart = weekDates[0];
      const weekEnd = weekDates[6];
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return weekStart.toLocaleDateString(settings.language, {
          year: 'numeric',
          month: 'long',
        });
      }
      return `${weekStart.toLocaleDateString(settings.language, { month: 'numeric', day: 'numeric' })} – ${weekEnd.toLocaleDateString(settings.language, { month: 'numeric', day: 'numeric' })}`;
    }
    case CalendarViewType.DAY:
      return formatViewTitleDay(currentDate, settings);
    default:
      return '';
  }
}

function CalendarPageContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>(CalendarViewType.MONTH);
  const [activeTab, setActiveTab] = useState<CalendarMainTab>('calendar');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [dayPanelDate, setDayPanelDate] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(
    null
  );
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const { settings } = useCalendarSettings();
  const themeStyle = useMemo(() => getThemeCssProperties(settings), [settings]);

  const { isMobile } = useDeviceType();
  const { isAuthenticated } = useAuthContext();

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
      const dates = getMonthViewDates(currentDate, settings.weekStartsOn);
      start = dates[0];
      end = dates[dates.length - 1];
    } else if (viewType === CalendarViewType.WEEK) {
      const dates = getWeekViewDates(currentDate, settings.weekStartsOn);
      start = dates[0];
      end = dates[6];
    } else {
      start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);
    }
    fetchEvents(start, end).catch(() => {});
  }, [currentDate, viewType, fetchEvents, settings.weekStartsOn]);

  useEffect(() => {
    loadRangeForView();
  }, [loadRangeForView]);

  const viewTitle = useMemo(
    () => getViewTitle(viewType, currentDate, settings),
    [viewType, currentDate, settings]
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

  const requestDelete = useCallback(
    (eventId: number) => {
      setDeleteTargetId(eventId);
      if (isEventModalOpen) {
        setIsEventModalOpen(false);
      }
    },
    [isEventModalOpen]
  );

  const cancelDelete = useCallback(() => {
    const reopenEditModal = editingEvent?.id === deleteTargetId;
    setDeleteTargetId(null);
    if (reopenEditModal) {
      setIsEventModalOpen(true);
    }
  }, [editingEvent, deleteTargetId]);

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

  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-violet-50/20">
      <main className="mx-auto flex min-h-[100dvh] max-w-7xl flex-col px-3 py-3 sm:px-5 sm:py-4 lg:px-8">
        <CalendarHeaderNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAuthenticated={isAuthenticated}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onOpenSettings={() => setActiveTab('settings')}
        />

        {error && (
            <div
              role="alert"
              className="mt-3 flex items-start justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]"
            >
              <span className="text-pretty">{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="flex h-10 shrink-0 items-center px-2 font-medium text-red-600 transition-transform active:scale-[0.96]"
              >
                关闭
              </button>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3">
              {!isAuthenticated && (
                <p className="rounded-xl bg-amber-50/90 px-4 py-2.5 text-sm text-amber-900 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.25)]">
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
              <div
                className="min-h-0 flex-1 overflow-auto rounded-2xl bg-white/90 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)]"
                style={themeStyle}
              >
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
            </div>
          )}

          {activeTab === 'events' && (
            <div className="mt-3 min-h-0 flex-1 overflow-auto">
              <EventList
                events={events}
                config={eventListConfig}
                onConfigChange={setEventListConfig}
                onEventClick={openEditModal}
                onEventEdit={openEditModal}
                onEventDelete={requestDelete}
                onBatchDelete={batchDeleteEvents}
                enableBatchActions
                loading={loading}
              />
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="mt-3 rounded-2xl bg-white/90 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
              <DateCalculatorTool variant="embedded" />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="mt-3 min-h-0 flex-1 overflow-auto">
              <CalendarSettings />
            </div>
          )}
      </main>

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
        onDelete={requestDelete}
        isAuthenticated={isAuthenticated}
        onRequireLogin={requireAuth}
      />

      <ImprovedEventModal
        isOpen={isEventModalOpen}
        onClose={handleModalClose}
        onSave={handleEventSave}
        onDelete={requestDelete}
        event={editingEvent}
        initialDate={selectedDate ?? undefined}
        isMobile={isMobile}
      />

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={cancelDelete}
        onConfirm={() => deleteTargetId && confirmDelete(deleteTargetId)}
        title="删除活动"
        message="确定删除此活动？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
      />

      <LoginRegisterModals
        loginOpen={isLoginModalOpen}
        registerOpen={isRegisterModalOpen}
        onCloseLogin={() => setIsLoginModalOpen(false)}
        onCloseRegister={() => setIsRegisterModalOpen(false)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(false);
          showToast('登录成功');
        }}
      />

      <CalendarToast message={toast?.message ?? null} variant={toast?.variant} />
    </div>
  );
}

export default function CalendarPage() {
  return (
    <AuthProvider>
      <AiApiSettingsProvider>
        <CalendarSettingsProvider>
          <CalendarPageContent />
        </CalendarSettingsProvider>
      </AiApiSettingsProvider>
    </AuthProvider>
  );
}
