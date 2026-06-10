'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from 'sa2kit/common/components';
import { AlertCircle, Copy, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  EventType,
  EventData,
  EventTypeService,
} from '../services/eventTypeService';
import { CalendarEvent, EventPriority } from '../types';
import EventTypeSelector from './eventModal/EventTypeSelector';
import EventDetailsSection from './eventModal/EventDetailsSection';
import EventTimeSection from './eventModal/EventTimeSection';
import EventAppearanceSection from './eventModal/EventAppearanceSection';
import EventModalTabBar, { type EventModalTab } from './eventModal/EventModalTabBar';
import ImageToEventButton from './ImageToEventButton';
import type { CalendarEventFromImageOutput } from '../ai/eventFromImageTask.types';
import {
  formatDateOnly,
  formatDateTimeLocal,
  formatTimeOnly,
} from './eventModal/formUtils';
import {
  dangerButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from './eventModal/styles';
import { DEFAULT_FORM_DATA, type EventModalFormData } from './eventModal/types';
import { useCalendarSettings } from '../context/CalendarSettingsContext';
import { buildDefaultEventTimes } from '../utils/calendarSettingsCore';

interface ImprovedEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: EventData) => Promise<void>;
  onDelete?: (eventId: number) => void;
  event?: CalendarEvent | null;
  initialDate?: Date;
  isMobile?: boolean;
}

async function copyTextToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

function resolveTabForError(message: string, isEditMode: boolean): EventModalTab {
  if (message.includes('标题')) return 'details';
  if (message.includes('颜色')) return 'appearance';
  if (
    message.includes('时间') ||
    message.includes('日期') ||
    message.includes('重复') ||
    message.includes('结束')
  ) {
    return 'schedule';
  }
  return isEditMode ? 'details' : 'type';
}

const ImprovedEventModal: React.FC<ImprovedEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  initialDate,
  isMobile = false,
}) => {
  const [eventType, setEventType] = useState<EventType>(EventType.SINGLE);
  const [activeTab, setActiveTab] = useState<EventModalTab>('details');
  const [formData, setFormData] = useState<EventModalFormData>(DEFAULT_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(null);

  const { settings } = useCalendarSettings();
  const isEditMode = !!event;

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(isEditMode ? 'details' : 'type');
    setErrors({});
  }, [isOpen, isEditMode]);

  useEffect(() => {
    if (event) {
      const startDate = new Date(event.startTime);
      const endDate = new Date(event.endTime);

      setEventType(EventType.SINGLE);
      setFormData({
        ...DEFAULT_FORM_DATA,
        title: event.title,
        description: event.description || '',
        location: event.location || '',
        color: event.color || '#3b82f6',
        priority: event.priority || EventPriority.NORMAL,
        allDay: event.allDay,
        startTime: formatDateTimeLocal(startDate),
        endTime: formatDateTimeLocal(endDate),
        startDate: formatDateOnly(startDate),
        endDate: formatDateOnly(endDate),
        dailyStartTime: formatTimeOnly(startDate),
        dailyEndTime: formatTimeOnly(endDate),
        recurrenceStartDate: formatDateOnly(startDate),
        recurrenceStartTime: formatDateTimeLocal(startDate),
        recurrenceEndTime: formatDateTimeLocal(endDate),
      });
    } else if (initialDate) {
      const { start: startDateTime, end: endDateTime } = buildDefaultEventTimes(
        initialDate,
        settings
      );

      setFormData((prev) => ({
        ...prev,
        startTime: formatDateTimeLocal(startDateTime),
        endTime: formatDateTimeLocal(endDateTime),
        startDate: formatDateOnly(startDateTime),
        endDate: formatDateOnly(startDateTime),
        recurrenceStartDate: formatDateOnly(startDateTime),
        recurrenceStartTime: formatDateTimeLocal(startDateTime),
        recurrenceEndTime: formatDateTimeLocal(endDateTime),
      }));
    }
  }, [event, initialDate, settings]);

  const buildEventData = (): EventData => {
    switch (eventType) {
      case EventType.SINGLE:
        return {
          type: EventType.SINGLE,
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          location: formData.location.trim() || undefined,
          color: formData.color,
          priority: formData.priority,
          allDay: formData.allDay,
          startTime: new Date(formData.startTime),
          endTime: new Date(formData.endTime),
        };

      case EventType.MULTI_DAY:
        return {
          type: EventType.MULTI_DAY,
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          location: formData.location.trim() || undefined,
          color: formData.color,
          priority: formData.priority,
          allDay: formData.allDay,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          startTime: formData.allDay ? undefined : formData.dailyStartTime,
          endTime: formData.allDay ? undefined : formData.dailyEndTime,
        };

      case EventType.RECURRING:
        return {
          type: EventType.RECURRING,
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          location: formData.location.trim() || undefined,
          color: formData.color,
          priority: formData.priority,
          allDay: formData.allDay,
          startDate: new Date(formData.recurrenceStartDate),
          startTime: new Date(formData.recurrenceStartTime),
          endTime: new Date(formData.recurrenceEndTime),
          recurrence: {
            pattern: formData.recurrencePattern,
            interval: formData.recurrenceInterval,
            endDate:
              formData.useEndDate && formData.recurrenceEndDate
                ? new Date(formData.recurrenceEndDate)
                : undefined,
            count:
              !formData.useEndDate && formData.recurrenceCount > 0
                ? formData.recurrenceCount
                : undefined,
          },
        };

      default:
        throw new Error(`不支持的活动类型: ${eventType}`);
    }
  };

  const validateForm = (): boolean => {
    const eventData = buildEventData();
    const validationErrors = EventTypeService.validateEventData(eventData);

    if (validationErrors.length === 0) {
      setErrors({});
      return true;
    }

    const firstError = validationErrors[0];
    setErrors({ general: validationErrors.join('\n') });
    setActiveTab(resolveTabForError(firstError, isEditMode));
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const eventData = buildEventData();
      await onSave(eventData);
      onClose();
    } catch (error) {
      console.error('保存活动失败:', error);
      setErrors({ submit: '保存活动失败，请重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof EventModalFormData,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: '' }));
    }
  };

  const handleDeleteRequest = () => {
    if (!event?.id || !onDelete) return;
    onDelete(event.id);
  };

  const handleClose = () => {
    setErrors({});
    if (aiPreviewUrl) URL.revokeObjectURL(aiPreviewUrl);
    setAiPreviewUrl(null);
    onClose();
  };

  const applyAiDraft = (draft: CalendarEventFromImageOutput, previewUrl: string) => {
    setEventType(EventType.SINGLE);
    const startDate = new Date(draft.startTime);
    const endDate = new Date(draft.endTime);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setErrors({ general: '识别的时间格式无效，请手动填写' });
      URL.revokeObjectURL(previewUrl);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      title: draft.title,
      description: draft.description || '',
      location: draft.location || '',
      allDay: draft.allDay,
      startTime: formatDateTimeLocal(startDate),
      endTime: formatDateTimeLocal(endDate),
      startDate: formatDateOnly(startDate),
      endDate: formatDateOnly(endDate),
      dailyStartTime: formatTimeOnly(startDate),
      dailyEndTime: formatTimeOnly(endDate),
      recurrenceStartDate: formatDateOnly(startDate),
      recurrenceStartTime: formatDateTimeLocal(startDate),
      recurrenceEndTime: formatDateTimeLocal(endDate),
    }));

    if (aiPreviewUrl) URL.revokeObjectURL(aiPreviewUrl);
    setAiPreviewUrl(previewUrl);
    setActiveTab('details');

    if (draft.confidence < 0.6) {
      setErrors({
        general: `识别完成（置信度 ${Math.round(draft.confidence * 100)}%），请核对时间与标题`,
      });
    } else {
      setErrors({});
    }
  };

  const timeVariant =
    eventType === EventType.MULTI_DAY
      ? 'multi_day'
      : eventType === EventType.RECURRING
        ? 'recurring'
        : 'single';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      width={isMobile ? '100%' : '720px'}
      height="auto"
      maskClosable={false}
      className="gap-0 overflow-hidden border-0 bg-white p-0 shadow-xl sm:max-w-[720px] [&>button.absolute]:hidden [&>div]:py-0"
    >
      <div className={`relative ${isMobile ? 'flex max-h-[100dvh] flex-col' : ''}`}>
        <header className="px-5 py-4 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              {isEditMode ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <h2 className="text-balance text-lg font-semibold text-slate-900">
              {isEditMode ? '编辑活动' : '创建活动'}
            </h2>
            {!isEditMode && (
              <ImageToEventButton
                className="ml-auto"
                onResult={applyAiDraft}
                onError={(message) => setErrors({ general: message })}
              />
            )}
          </div>
          {aiPreviewUrl && !isEditMode && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-violet-50/80 px-3 py-2">
              <img
                src={aiPreviewUrl}
                alt="识图来源"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <p className="text-xs text-violet-800">已根据此图片预填活动信息</p>
            </div>
          )}
        </header>

        <div className="px-4 pt-4 sm:px-6">
          <EventModalTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isEditMode={isEditMode}
          />
        </div>

        <div
          className={`overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 ${
            isMobile ? 'max-h-[calc(100dvh-11rem)] flex-1' : 'max-h-[58vh] min-h-[280px]'
          }`}
        >
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait" initial={false}>
              {activeTab === 'type' && !isEditMode && (
                <motion.div
                  key="tab-type"
                  role="tabpanel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                >
                  <EventTypeSelector value={eventType} onChange={setEventType} />
                </motion.div>
              )}

              {activeTab === 'details' && (
                <motion.div
                  key="tab-details"
                  role="tabpanel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                >
                  <EventDetailsSection
                    formData={formData}
                    errors={errors}
                    onChange={handleInputChange}
                  />
                </motion.div>
              )}

              {activeTab === 'schedule' && (
                <motion.div
                  key="tab-schedule"
                  role="tabpanel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                >
                  <EventTimeSection
                    formData={formData}
                    variant={timeVariant}
                    onChange={handleInputChange}
                  />
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div
                  key="tab-appearance"
                  role="tabpanel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                >
                  <EventAppearanceSection formData={formData} onChange={handleInputChange} />
                </motion.div>
              )}
            </AnimatePresence>

            {(errors.general || errors.submit) && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                className="mt-4 space-y-2"
              >
                {errors.general && (
                  <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-red-800">请检查表单</p>
                        <button
                          type="button"
                          onClick={() => void copyTextToClipboard(errors.general)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                          aria-label="复制错误信息"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          复制
                        </button>
                      </div>
                      <p
                        className="mt-1 cursor-text select-text whitespace-pre-wrap break-words text-sm text-red-600"
                        role="status"
                      >
                        {errors.general}
                      </p>
                    </div>
                  </div>
                )}
                {errors.submit && (
                  <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-red-800">保存失败</p>
                        <button
                          type="button"
                          onClick={() => void copyTextToClipboard(errors.submit)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                          aria-label="复制错误信息"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          复制
                        </button>
                      </div>
                      <p
                        className="mt-1 cursor-text select-text whitespace-pre-wrap break-words text-sm text-red-600"
                        role="status"
                      >
                        {errors.submit}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </form>
        </div>

        <footer className="flex items-center justify-between gap-3 px-5 py-4 shadow-[0_-1px_0_rgba(15,23,42,0.06)]">
          <div>
            {isEditMode && onDelete && (
              <button type="button" onClick={handleDeleteRequest} className={dangerButtonClass}>
                <Trash2 className="h-4 w-4" />
                删除
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleClose} className={secondaryButtonClass}>
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className={primaryButtonClass}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditMode ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isLoading ? '保存中…' : isEditMode ? '保存更改' : '创建活动'}
            </button>
          </div>
        </footer>
      </div>
    </Modal>
  );
};

export default ImprovedEventModal;
