/** 外层区块：rounded-2xl + p-4，内层输入 rounded-xl（同心圆角 16+8=24） */
export const sectionClass =
  'rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_4px_12px_rgba(15,23,42,0.04)]';

export const inputClass =
  'w-full rounded-xl border-0 bg-slate-50/80 px-4 py-3 text-slate-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] transition-[box-shadow,background-color] placeholder:text-slate-400 hover:bg-slate-50 focus:bg-white focus:shadow-[inset_0_0_0_2px_rgba(124,58,237,0.4)] focus:outline-none';

export const labelClass = 'text-sm font-medium text-slate-800';

export const hintClass = 'text-pretty text-xs text-slate-500';

export const sectionHeadingClass = 'text-balance text-base font-semibold text-slate-900';

export const primaryButtonClass =
  'inline-flex h-11 min-w-[5.5rem] items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-transform hover:bg-violet-700 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50';

export const secondaryButtonClass =
  'inline-flex h-11 min-w-[5.5rem] items-center justify-center rounded-xl bg-white px-5 text-sm font-medium text-slate-700 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-transform hover:bg-slate-50 active:scale-[0.96]';

export const dangerButtonClass =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-red-600 shadow-[0_0_0_1px_rgba(239,68,68,0.35)] transition-transform hover:bg-red-50 active:scale-[0.96]';

export const iconButtonClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-transform hover:bg-slate-100 active:scale-[0.96]';
