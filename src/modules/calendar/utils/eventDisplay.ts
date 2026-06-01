import { EventPriority } from '../types';

/** 事件颜色 → Tailwind 样式（月格、列表共用） */
export function getEventSurfaceClasses(color?: string): string {
  const hexMap: Record<string, string> = {
    '#3B82F6': 'bg-blue-500/15 text-blue-900 ring-1 ring-blue-500/25',
    '#10B981': 'bg-emerald-500/15 text-emerald-900 ring-1 ring-emerald-500/25',
    '#8B5CF6': 'bg-violet-500/15 text-violet-900 ring-1 ring-violet-500/25',
    '#EF4444': 'bg-red-500/15 text-red-900 ring-1 ring-red-500/25',
    '#F59E0B': 'bg-amber-500/15 text-amber-900 ring-1 ring-amber-500/25',
    '#EC4899': 'bg-pink-500/15 text-pink-900 ring-1 ring-pink-500/25',
    '#6366F1': 'bg-indigo-500/15 text-indigo-900 ring-1 ring-indigo-500/25',
    '#6B7280': 'bg-slate-500/15 text-slate-900 ring-1 ring-slate-500/25',
  };
  const namedMap: Record<string, string> = {
    blue: 'bg-blue-500/15 text-blue-900 ring-1 ring-blue-500/25',
    green: 'bg-emerald-500/15 text-emerald-900 ring-1 ring-emerald-500/25',
    red: 'bg-red-500/15 text-red-900 ring-1 ring-red-500/25',
    purple: 'bg-violet-500/15 text-violet-900 ring-1 ring-violet-500/25',
    yellow: 'bg-amber-500/15 text-amber-900 ring-1 ring-amber-500/25',
  };
  if (!color) return 'bg-slate-500/15 text-slate-900 ring-1 ring-slate-500/25';
  return hexMap[color] ?? namedMap[color] ?? hexMap['#3B82F6'];
}

export function getPriorityLabel(priority: EventPriority): {
  text: string;
  className: string;
} {
  switch (priority) {
    case EventPriority.URGENT:
      return { text: '紧急', className: 'bg-red-500/15 text-red-800 ring-1 ring-red-500/30' };
    case EventPriority.HIGH:
      return { text: '高', className: 'bg-orange-500/15 text-orange-800 ring-1 ring-orange-500/30' };
    case EventPriority.LOW:
      return { text: '低', className: 'bg-slate-500/15 text-slate-700 ring-1 ring-slate-400/30' };
    default:
      return { text: '普通', className: 'bg-violet-500/15 text-violet-800 ring-1 ring-violet-500/30' };
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
