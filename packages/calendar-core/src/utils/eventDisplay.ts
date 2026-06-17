import { EventPriority } from '../types';
import {
  eventSurfaceClass,
  priorityBadgeClass,
  type EventSurfaceKey,
} from '../calendarStyles';

const HEX_SURFACE_MAP: Record<string, EventSurfaceKey> = {
  '#3B82F6': 'blue',
  '#10B981': 'green',
  '#8B5CF6': 'purple',
  '#EF4444': 'red',
  '#F59E0B': 'yellow',
  '#EC4899': 'pink',
  '#6366F1': 'indigo',
  '#6B7280': 'gray',
};

const NAMED_SURFACE_MAP: Record<string, EventSurfaceKey> = {
  blue: 'blue',
  green: 'green',
  red: 'red',
  purple: 'purple',
  yellow: 'yellow',
};

/** 事件颜色 → animal-island 暖色样式（月格、列表共用） */
export function getEventSurfaceClasses(color?: string): string {
  if (!color) return eventSurfaceClass('gray');
  const key = HEX_SURFACE_MAP[color] ?? NAMED_SURFACE_MAP[color] ?? 'blue';
  return eventSurfaceClass(key);
}

export function getPriorityLabel(priority: EventPriority): {
  text: string;
  className: string;
} {
  switch (priority) {
    case EventPriority.URGENT:
      return { text: '紧急', className: priorityBadgeClass('urgent') };
    case EventPriority.HIGH:
      return { text: '高', className: priorityBadgeClass('high') };
    case EventPriority.LOW:
      return { text: '低', className: priorityBadgeClass('low') };
    default:
      return { text: '普通', className: priorityBadgeClass('normal') };
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
