/** teach-hub-mobile 主题常量（对齐 animal-island-ui + teach-hub-core tw.ts） */

import { ai } from './ui/tokens';

export const thColors = {
  bg: ai.bg,
  text: ai.text,
  textMuted: ai.textSecondary,
  textSoft: ai.textBody,
  textBody: ai.textBody,
  link: ai.primary,
  accent: ai.primary,
  border: ai.borderLight,
  borderSoft: ai.borderLight,
  panel: ai.bgPanel,
  panelMuted: ai.bg,
  featureIcon: ai.primaryBg,
  featureIconText: ai.primaryActive,
  danger: ai.error,
  lessonDoneBorder: ai.lessonDoneBorder,
  lessonDoneBg: ai.lessonDoneBg,
} as const;

export const thScreen = 'flex-1 bg-[#f8f8f0]';
export const thTitle = 'text-2xl font-bold text-[#794f27]';
export const thDesc = 'text-[15px] leading-relaxed text-[#9f927d]';
export const thCard = 'rounded-[20px] bg-[#f7f3df] px-[18px] py-4';
export const thCardPressable =
  'mb-3 rounded-[20px] bg-[#f7f3df] px-[18px] py-4 active:opacity-90';
export const thPanel = 'rounded-[20px] border border-[#e8e2d6] bg-white px-[18px] py-4';
export const thTopbar =
  'border-b border-[#e8e2d6] bg-white/95 px-4 py-3';
export const thPanelLink = 'text-sm text-[#19c8b9]';
export const thChip =
  'rounded-full border border-[#b8e8df] bg-[#e6f9f6] px-3 py-1.5 active:opacity-90';
export const thLessonItem =
  'flex-row items-center justify-between gap-3 rounded-[10px] border border-[#e8e2d6] bg-[#f8f8f0] px-4 py-3.5 active:opacity-90';
export const thLessonItemDone = 'border-[#9ae6b4] bg-[#f0fff4]';
export const thInput =
  'rounded-[50px] border-[2.5px] border-[#c4b89e] bg-[#f7f3df] px-[18px] py-2.5 text-[15px] text-[#725d42]';
export const thInputMultiline =
  'min-h-[120px] rounded-2xl border-[2.5px] border-[#c4b89e] bg-[#f7f3df] px-[18px] py-2.5 text-[15px] text-[#725d42]';

/** @deprecated 请使用 `<Button type="primary" />` */
export const thPrimaryBtn =
  'rounded-[50px] border-2 border-[#f8f8f0] bg-[#f8f8f0] px-5 py-2.5 active:opacity-90';
/** @deprecated */
export const thPrimaryBtnText = 'font-semibold text-[#794f27]';
/** @deprecated 请使用 `<Button type="default" />` */
export const thSecondaryBtn =
  'rounded-[50px] border-2 border-[#aaa69d] bg-[#f8f8f0] px-4 py-2 active:opacity-90';
/** @deprecated */
export const thSecondaryBtnText = 'text-[13px] font-semibold text-[#794f27]';
/** @deprecated */
export const thBtnSmall = thPrimaryBtn;
/** @deprecated */
export const thBtnSmallText = 'text-[13px] font-semibold text-[#794f27]';
/** @deprecated */
export const thBtnSmallSecondary = thSecondaryBtn;
/** @deprecated */
export const thBtnSmallSecondaryText = thSecondaryBtnText;
/** @deprecated */
export const thBtnText = 'px-2 py-1.5 active:opacity-70';
/** @deprecated */
export const thBtnTextLabel = 'text-[13px] font-semibold text-[#9f927d]';
