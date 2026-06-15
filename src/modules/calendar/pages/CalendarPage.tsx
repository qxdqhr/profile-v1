'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthProvider, useAuthContext, LoginRegisterModals } from '@/lib/auth';
import { Plus } from 'lucide-react';
import 'animal-island-ui/style';
import { Button, Cursor, Loading, Modal } from 'animal-island-ui';
import { Nunito, Noto_Sans_SC } from 'next/font/google';
import { DateCalculatorTool } from '@/modules/dateCalculator';
import { cal, modalActionsClass } from '../calendarStyles';

const calNunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cal-nunito',
});

const calNotoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-cal-noto',
});
import {
  CalendarViewType,
  EventListDisplayMode,
  EventSortField,
  SortDirection,
  EventPriority,
  EventListConfig,
  getMonthViewDates,
  getWeekViewDates,
  getDayEnd,
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
import { AiApiSettingsProvider, DEFAULT_AI_API_SETTINGS } from '@/modules/aiApi';
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
      end = getDayEnd(dates[dates.length - 1]);
    } else if (viewType === CalendarViewType.WEEK) {
      const dates = getWeekViewDates(currentDate, settings.weekStartsOn);
      start = dates[0];
      end = getDayEnd(dates[6]);
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
      const latest = events.find((e) => e.id === event.id) ?? event;
      setEditingEvent(latest);
      setSelectedDate(null);
      setIsEventModalOpen(true);
      setDayPanelDate(null);
    },
    [isAuthenticated, requireAuth, events]
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
          loadRangeForView();
        }
        setIsEventModalOpen(false);
        setEditingEvent(null);
        setSelectedDate(null);
      } catch (err) {
        showToast('保存失败，请重试', 'error');
        throw err;
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
          <div className="h-full min-h-0">
            <CalendarWeekView
              currentDate={currentDate}
              events={events}
              onDateClick={handleDateClick}
              onEventClick={openEditModal}
              onShowDayEvents={setDayPanelDate}
            />
          </div>
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
    <Cursor>
      <div
        className={`${cal.root} ${calNunito.variable} ${calNotoSansSC.variable}`}
        style={themeStyle}
      >
        <main className={cal.main}>
          <CalendarHeaderNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isAuthenticated={isAuthenticated}
            onLoginClick={() => setIsLoginModalOpen(true)}
            onOpenSettings={() => setActiveTab('settings')}
          />

          {error && (
            <div role="alert" className={`${cal.alert} ${cal.alertError}`}>
              <span className="text-pretty">{error}</span>
              <Button type="text" size="small" onClick={clearError}>
                关闭
              </Button>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
              {!isAuthenticated && (
                <p className={`${cal.alert} ${cal.alertWarn}`}>登录后可创建与保存活动。</p>
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
                className={
                  viewType === CalendarViewType.WEEK
                    ? `${cal.surface} ${cal.surfaceWeek}`
                    : cal.surface
                }
              >
                {loading && events.length === 0 ? (
                  <div className={cal.loadingWrap}>
                    <Loading active />
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
                onEventEdit={openEditModal}
                onEventDelete={requestDelete}
                onBatchDelete={batchDeleteEvents}
                enableBatchActions
                loading={loading}
              />
            </div>
          )}

          {activeTab === 'tools' && (
            <div className={`${cal.panel} mt-3 p-4 sm:p-6`}>
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
          <div className={cal.fab}>
            <Button
              type="primary"
              size="large"
              onClick={() => openCreateModal(currentDate)}
              aria-label="新建活动"
              style={{ width: 56, height: 56, borderRadius: '50%', padding: 0 }}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
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

        <Modal
          open={deleteTargetId !== null}
          onClose={cancelDelete}
          title="删除活动"
          typewriter={false}
          footer={
            <div className={modalActionsClass()}>
              <Button type="default" onClick={cancelDelete}>
                取消
              </Button>
              <Button
                type="danger-primary"
                onClick={() => deleteTargetId && void confirmDelete(deleteTargetId)}
              >
                删除
              </Button>
            </div>
          }
        >
          确定删除此活动？此操作无法撤销。
        </Modal>

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
    </Cursor>
  );
}

export default function CalendarPage() {
  return (
    <AuthProvider>
      <AiApiSettingsProvider defaultSettings={DEFAULT_AI_API_SETTINGS}>
        <CalendarSettingsProvider>
          <CalendarPageContent />
        </CalendarSettingsProvider>
      </AiApiSettingsProvider>
    </AuthProvider>
  );
}
