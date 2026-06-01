'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Modal, ConfirmModal } from 'sa2kit/components';
import { AlertCircle, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  EventType,
  EventData,
  EventTypeService,
} from '../services/eventTypeService';
import { CalendarEvent, EventPriority } from '../types';
import EventTypeSelector from './eventModal/EventTypeSelector';
import EventBasicSection from './eventModal/EventBasicSection';
import EventTimeSection from './eventModal/EventTimeSection';
import {
  formatDateOnly,
  formatDateTimeLocal,
  formatTimeOnly,
} from './eventModal/formUtils';
import {
  dangerButtonClass,
  iconButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
  sectionHeadingClass,
} from './eventModal/styles';
import { DEFAULT_FORM_DATA, type EventModalFormData } from './eventModal/types';

interface ImprovedEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: EventData) => Promise<void>;
  onDelete?: (eventId: number) => void;
  event?: CalendarEvent | null;
  initialDate?: Date;
  isMobile?: boolean;
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
  const [formData, setFormData] = useState<EventModalFormData>(DEFAULT_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditMode = !!event;

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
      const startDateTime = new Date(initialDate);
      startDateTime.setHours(9, 0, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(10, 0, 0, 0);

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
  }, [event, initialDate]);

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

    const newErrors: Record<string, string> = {};
    validationErrors.forEach((error) => {
      newErrors.general = error;
    });

    setErrors(newErrors);
    return validationErrors.length === 0;
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
    setShowDeleteConfirm(false);
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const timeVariant =
    eventType === EventType.MULTI_DAY
      ? 'multi_day'
      : eventType === EventType.RECURRING
        ? 'recurring'
        : 'single';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        width={isMobile ? '100%' : '720px'}
        height="auto"
      >
        <div className={`relative ${isMobile ? 'flex max-h-[100dvh] flex-col' : ''}`}>
          <header className="flex items-start justify-between gap-3 px-5 py-4 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                {isEditMode ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="text-balance text-lg font-semibold text-slate-900">
                  {isEditMode ? '编辑活动' : '创建活动'}
                </h2>
                <p className="text-pretty text-sm text-slate-500">
                  {isEditMode ? '修改活动信息与时间安排' : '填写活动详情并保存到日历'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className={iconButtonClass}
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div
            className={`overflow-y-auto px-4 py-5 sm:px-6 ${
              isMobile ? 'max-h-[calc(100dvh-8rem)] flex-1' : 'max-h-[70vh]'
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {!isEditMode && (
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                  className="rounded-2xl bg-slate-50/60 p-4"
                >
                  <EventTypeSelector value={eventType} onChange={setEventType} />
                </motion.section>
              )}

              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-1 rounded-full bg-violet-500" aria-hidden />
                  <h3 className={sectionHeadingClass}>基本信息</h3>
                </div>
                <EventBasicSection
                  formData={formData}
                  errors={errors}
                  onChange={handleInputChange}
                  staggerBase={0.1}
                />
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-1 rounded-full bg-emerald-500" aria-hidden />
                  <h3 className={sectionHeadingClass}>时间安排</h3>
                </div>
                <EventTimeSection
                  formData={formData}
                  variant={timeVariant}
                  onChange={handleInputChange}
                  staggerBase={0.2}
                />
              </section>

              {(errors.general || errors.submit) && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                  className="space-y-2"
                >
                  {errors.general && (
                    <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-red-800">请检查表单</p>
                        <p className="text-pretty text-sm text-red-600">{errors.general}</p>
                      </div>
                    </div>
                  )}
                  {errors.submit && (
                    <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      <p className="text-pretty text-sm text-red-600">{errors.submit}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </form>
          </div>

          <footer className="flex items-center justify-between gap-3 px-5 py-4 shadow-[0_-1px_0_rgba(15,23,42,0.06)]">
            <div>
              {isEditMode && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className={dangerButtonClass}
                >
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

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteRequest}
        title="确认删除"
        message="确定要删除这个活动吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        isLoading={isLoading}
      />
    </>
  );
};

export default ImprovedEventModal;
