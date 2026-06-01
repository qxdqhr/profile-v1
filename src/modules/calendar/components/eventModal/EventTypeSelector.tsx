'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CalendarRange, Repeat2, Check } from 'lucide-react';
import { EventType } from '../../services/eventTypeService';
import { hintClass, sectionClass, sectionHeadingClass } from './styles';

const TYPE_OPTIONS = [
  {
    type: EventType.SINGLE,
    icon: CalendarDays,
    title: '单次活动',
    subtitle: '一次性安排',
    activeRing: 'ring-violet-500/30',
    activeBg: 'bg-violet-50',
    activeText: 'text-violet-800',
    checkBg: 'bg-violet-600',
    hint: {
      title: '单次活动',
      body: '在指定时间发生一次，如会议、约会、面试等。',
    },
  },
  {
    type: EventType.MULTI_DAY,
    icon: CalendarRange,
    title: '多天活动',
    subtitle: '连续多天',
    activeRing: 'ring-emerald-500/30',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-800',
    checkBg: 'bg-emerald-600',
    hint: {
      title: '多天活动',
      body: '持续多天的单个活动，如培训课程、假期等。',
    },
  },
  {
    type: EventType.RECURRING,
    icon: Repeat2,
    title: '重复活动',
    subtitle: '周期性重复',
    activeRing: 'ring-indigo-500/30',
    activeBg: 'bg-indigo-50',
    activeText: 'text-indigo-800',
    checkBg: 'bg-indigo-600',
    hint: {
      title: '重复活动',
      body: '按规律重复发生，如每日晨会、每周例会等。',
    },
  },
] as const;

interface EventTypeSelectorProps {
  value: EventType;
  onChange: (type: EventType) => void;
}

export default function EventTypeSelector({ value, onChange }: EventTypeSelectorProps) {
  const activeHint = TYPE_OPTIONS.find((o) => o.type === value)?.hint;

  return (
    <div className="space-y-4">
      <h3 className={sectionHeadingClass}>选择活动类型</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {TYPE_OPTIONS.map((option, index) => {
          const selected = value === option.type;
          const Icon = option.icon;

          return (
            <motion.button
              key={option.type}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, type: 'spring', duration: 0.3, bounce: 0 }}
              onClick={() => onChange(option.type)}
              className={`relative rounded-2xl p-4 text-left transition-[box-shadow,background-color,transform] active:scale-[0.96] ${
                selected
                  ? `${option.activeBg} shadow-sm ring-2 ${option.activeRing}`
                  : 'bg-slate-50/80 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl transition-[transform,opacity] ${
                    selected ? `${option.activeText} scale-100 opacity-100` : 'text-slate-500'
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <p className={`text-sm font-semibold ${selected ? option.activeText : 'text-slate-900'}`}>
                  {option.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{option.subtitle}</p>
              </div>
              {selected && (
                <span
                  className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full ${option.checkBg}`}
                >
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {activeHint && (
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          className={`${sectionClass} !p-3`}
        >
          <p className="text-sm font-medium text-slate-800">{activeHint.title}</p>
          <p className={`mt-1 ${hintClass}`}>{activeHint.body}</p>
        </motion.div>
      )}
    </div>
  );
}
