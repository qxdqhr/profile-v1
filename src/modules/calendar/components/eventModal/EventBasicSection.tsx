'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlignLeft, MapPin, Palette, Star } from 'lucide-react';
import { EventPriority } from '../../types';
import { EVENT_COLOR_PRESETS } from '../../utils/eventDisplay';
import type { EventModalFormData } from './types';
import { hintClass, inputClass, labelClass, sectionClass } from './styles';

interface EventBasicSectionProps {
  formData: EventModalFormData;
  errors: Record<string, string>;
  onChange: (field: keyof EventModalFormData, value: string | boolean | number) => void;
  staggerBase?: number;
}

const PRIORITY_OPTIONS = [
  { value: EventPriority.LOW, label: '低', tone: 'text-slate-700 bg-slate-50 ring-slate-200/80' },
  { value: EventPriority.NORMAL, label: '普通', tone: 'text-violet-700 bg-violet-50 ring-violet-200/80' },
  { value: EventPriority.HIGH, label: '高', tone: 'text-amber-700 bg-amber-50 ring-amber-200/80' },
  { value: EventPriority.URGENT, label: '紧急', tone: 'text-red-700 bg-red-50 ring-red-200/80' },
] as const;

function FieldBlock({
  index,
  staggerBase,
  label,
  icon: Icon,
  required,
  children,
  hint,
}: {
  index: number;
  staggerBase: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: staggerBase + index * 0.08, type: 'spring', duration: 0.3, bounce: 0 }}
      className="space-y-2"
    >
      <label className={`inline-flex items-center gap-2 ${labelClass}`}>
        <Icon className="h-4 w-4 text-slate-400" aria-hidden />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className={hintClass}>{hint}</p>}
    </motion.div>
  );
}

export default function EventBasicSection({
  formData,
  errors,
  onChange,
  staggerBase = 0,
}: EventBasicSectionProps) {
  return (
    <div className="space-y-5">
      <FieldBlock index={0} staggerBase={staggerBase} label="活动标题" icon={AlignLeft} required>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          className={`${inputClass} ${errors.title ? 'shadow-[inset_0_0_0_2px_rgba(239,68,68,0.5)]' : ''}`}
          placeholder="为活动起个名字"
          autoFocus
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
      </FieldBlock>

      <FieldBlock index={1} staggerBase={staggerBase} label="活动描述" icon={AlignLeft}>
        <textarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="补充说明（可选）"
        />
        {formData.description.length > 0 && (
          <p className={`tabular-nums ${hintClass}`}>已输入 {formData.description.length} 字</p>
        )}
      </FieldBlock>

      <FieldBlock index={2} staggerBase={staggerBase} label="地点" icon={MapPin}>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => onChange('location', e.target.value)}
          className={inputClass}
          placeholder="活动举办地点（可选）"
        />
      </FieldBlock>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: staggerBase + 0.24, type: 'spring', duration: 0.3, bounce: 0 }}
        className={`${sectionClass} !p-3`}
      >
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <p className={labelClass}>全天活动</p>
            <p className={hintClass}>不设置具体时间，整天有效</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={formData.allDay}
            onClick={() => onChange('allDay', !formData.allDay)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-[background-color] ${
              formData.allDay ? 'bg-violet-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                formData.allDay ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: staggerBase + 0.32, type: 'spring', duration: 0.3, bounce: 0 }}
          className="space-y-3"
        >
          <label className={`inline-flex items-center gap-2 ${labelClass}`}>
            <Palette className="h-4 w-4 text-slate-400" aria-hidden />
            活动颜色
          </label>
          <div className="flex items-center gap-3">
            <label
              className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] transition-transform active:scale-[0.96]"
              style={{ backgroundColor: formData.color }}
            >
              <input
                type="color"
                value={formData.color}
                onChange={(e) => onChange('color', e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="选择自定义颜色"
              />
            </label>
            <span className="tabular-nums text-sm font-medium text-slate-700">
              {formData.color.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EVENT_COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onChange('color', color)}
                aria-label={`选择颜色 ${color}`}
                className={`h-10 w-10 rounded-xl transition-[transform,box-shadow] active:scale-[0.96] ${
                  formData.color === color
                    ? 'shadow-[0_0_0_2px_rgba(124,58,237,0.5),inset_0_0_0_1px_rgba(0,0,0,0.1)]'
                    : 'shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: staggerBase + 0.4, type: 'spring', duration: 0.3, bounce: 0 }}
          className="space-y-2"
        >
          <label className={`inline-flex items-center gap-2 ${labelClass}`}>
            <Star className="h-4 w-4 text-slate-400" aria-hidden />
            优先级
          </label>
          <div className="space-y-1.5">
            {PRIORITY_OPTIONS.map((option) => {
              const selected = formData.priority === option.value;
              return (
                <label key={option.value} className="block cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value={option.value}
                    checked={selected}
                    onChange={() => onChange('priority', option.value)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-10 items-center rounded-xl px-3 text-sm font-medium transition-[background-color,box-shadow] active:scale-[0.96] ${
                      selected
                        ? `${option.tone} shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] ring-2 ring-current/15`
                        : 'bg-slate-50/80 text-slate-600 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
