import { EventPriority } from '../types';

/** 事件颜色 → animal-island 暖色样式（月格、列表共用） */
export function getEventSurfaceClasses(color?: string): string {
  const hexMap: Record<string, string> = {
    '#3B82F6': 'cal-event-surface--blue',
    '#10B981': 'cal-event-surface--green',
    '#8B5CF6': 'cal-event-surface--purple',
    '#EF4444': 'cal-event-surface--red',
    '#F59E0B': 'cal-event-surface--yellow',
    '#EC4899': 'cal-event-surface--pink',
    '#6366F1': 'cal-event-surface--indigo',
    '#6B7280': 'cal-event-surface--gray',
  };
  const namedMap: Record<string, string> = {
    blue: 'cal-event-surface--blue',
    green: 'cal-event-surface--green',
    red: 'cal-event-surface--red',
    purple: 'cal-event-surface--purple',
    yellow: 'cal-event-surface--yellow',
  };
  if (!color) return 'cal-event-surface--gray';
  return hexMap[color] ?? namedMap[color] ?? hexMap['#3B82F6'];
}

export function getPriorityLabel(priority: EventPriority): {
  text: string;
  className: string;
} {
  switch (priority) {
    case EventPriority.URGENT:
      return { text: '紧急', className: 'cal-priority--urgent' };
    case EventPriority.HIGH:
      return { text: '高', className: 'cal-priority--high' };
    case EventPriority.LOW:
      return { text: '低', className: 'cal-priority--low' };
    default:
      return { text: '普通', className: 'cal-priority--normal' };
  }
}

export function mapStringToEventPriority(priority: string): EventPriority {
  switch (priority.toLowerCase()) {
    case 'low':
      return EventPriority.LOW;
    case 'high':
      return EventPriority.HIGH;
    case 'urgent':
      return EventPriority.URGENT;
    default:
      return EventPriority.NORMAL;
  }
}

export const EVENT_COLOR_PRESETS = [
  '#3B82F6',
  '#10B981',
  '#EF4444',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
] as const;
