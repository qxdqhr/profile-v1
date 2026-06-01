'use client';

import React from 'react';
import { CalendarDays, CalendarRange, Repeat2, Check } from 'lucide-react';
import { EventType } from '../../services/eventTypeService';
import { hintClass } from './styles';

const TYPE_OPTIONS = [
  {
    type: EventType.SINGLE,
    icon: CalendarDays,
    title: '单次',
    activeRing: 'ring-violet-500/30',
    activeBg: 'bg-violet-50',
    activeText: 'text-violet-800',
    checkBg: 'bg-violet-600',
    hint: '指定时间发生一次，如会议、约会等。',
  },
  {
    type: EventType.MULTI_DAY,
    icon: CalendarRange,
    title: '多天',
    activeRing: 'ring-emerald-500/30',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-800',
    checkBg: 'bg-emerald-600',
    hint: '连续多天的单个活动，如培训、假期等。',
  },
  {
    type: EventType.RECURRING,
    icon: Repeat2,
    title: '重复',
    activeRing: 'ring-indigo-500/30',
    activeBg: 'bg-indigo-50',
    activeText: 'text-indigo-800',
    checkBg: 'bg-indigo-600',
    hint: '按规律重复，如每日晨会、每周例会等。',
  },
] as const;

interface EventTypeSelectorProps {
  value: EventType;
  onChange: (type: EventType) => void;
}

export default function EventTypeSelector({ value, onChange }: EventTypeSelectorProps) {
  const activeHint = TYPE_OPTIONS.find((o) => o.type === value)?.hint;

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-3 gap-2">
        {TYPE_OPTIONS.map((option) => {
          const selected = value === option.type;
          const Icon = option.icon;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onChange(option.type)}
              className={`relative flex h-10 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-medium transition-[box-shadow,background-color,transform] active:scale-[0.96] ${
                selected
                  ? `${option.activeBg} shadow-sm ring-2 ${option.activeRing} ${option.activeText}`
                  : 'bg-slate-50/80 text-slate-700 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={selected ? 2.25 : 2} />
              <span className="truncate">{option.title}</span>
              {selected && (
                <span
                  className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full ${option.checkBg}`}
                >
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeHint && (
        <p className={`${hintClass} px-0.5`}>{activeHint}</p>
      )}
    </div>
  );
}
