'use client';

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { cn } from '../utils/cn';
import {
  isVerticalReaderPosition,
  type LessonReaderBarPosition,
} from '../utils/lessonReaderSettings';
import {
  thLessonProgress,
  thLessonProgressCollapsed,
  thLessonProgressCollapsedVertical,
  thLessonProgressLabel,
  thLessonProgressPercent,
  thLessonProgressRow,
  thLessonProgressShellHorizontal,
  thLessonProgressShellVertical,
  thLessonProgressSlider,
  thLessonProgressSliderVertical,
  thLessonProgressToggle,
} from '../styles/tw';

type LessonReadingProgressProps = {
  position: LessonReaderBarPosition;
  expanded: boolean;
  percent: number;
  onPercentChange: (value: number) => void;
  onDragEnd: () => void;
  onExpandedChange: (expanded: boolean) => void;
};

function ToggleIcon({ position, expanded }: { position: LessonReaderBarPosition; expanded: boolean }) {
  if (position === 'top') {
    return expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  }
  if (position === 'bottom') {
    return expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />;
  }
  if (position === 'left') {
    return expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />;
  }
  return expanded ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />;
}

export function LessonReadingProgress({
  position,
  expanded,
  percent,
  onPercentChange,
  onDragEnd,
  onExpandedChange,
}: LessonReadingProgressProps) {
  const vertical = isVerticalReaderPosition(position);

  if (!expanded) {
    return (
      <div
        className={cn(
          vertical ? thLessonProgressCollapsedVertical : thLessonProgressCollapsed,
          position === 'right' && 'border-l',
          position === 'left' && 'border-r',
          position === 'top' && 'border-b',
          position === 'bottom' && 'border-t',
        )}
        aria-label="阅读进度（已收起）"
      >
        <span className={cn(thLessonProgressPercent, vertical && 'text-sm')}>
          {percent.toFixed(1)}%
        </span>
        <button
          type="button"
          className={thLessonProgressToggle}
          aria-label="展开阅读进度条"
          onClick={() => {
            onDragEnd();
            onExpandedChange(true);
          }}
        >
          <ToggleIcon position={position} expanded={false} />
        </button>
      </div>
    );
  }

  const slider = (
    <input
      type="range"
      min={0}
      max={100}
      step={0.1}
      value={percent}
      className={vertical ? thLessonProgressSliderVertical : thLessonProgressSlider}
      aria-label="拖动调整阅读位置"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-valuetext={`已阅读 ${percent.toFixed(1)}%`}
      onChange={(e) => onPercentChange(Number(e.target.value))}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragEnd}
      onKeyUp={onDragEnd}
    />
  );

  return (
    <div
      className={cn(
        thLessonProgress,
        vertical ? thLessonProgressShellVertical : thLessonProgressShellHorizontal,
        position === 'right' && 'border-l border-[#e8e2d6]',
        position === 'left' && 'border-r border-[#e8e2d6]',
        position === 'bottom' && 'border-t border-[#e8e2d6]',
      )}
      aria-label="阅读进度"
    >
      {vertical ? (
        <>
          <button
            type="button"
            className={thLessonProgressToggle}
            aria-label="收起阅读进度条"
            onClick={() => {
              onDragEnd();
              onExpandedChange(false);
            }}
          >
            <ToggleIcon position={position} expanded />
          </button>
          <span className={cn(thLessonProgressPercent, 'text-base')}>{percent.toFixed(1)}%</span>
          <span className={cn(thLessonProgressLabel, 'text-[0.65rem] [writing-mode:vertical-rl]')}>
            阅读进度
          </span>
          {slider}
        </>
      ) : (
        <>
          <div className={thLessonProgressRow}>
            <span className={thLessonProgressLabel}>阅读进度</span>
            <div className="flex items-center gap-2">
              <span className={thLessonProgressPercent}>{percent.toFixed(1)}%</span>
              <button
                type="button"
                className={thLessonProgressToggle}
                aria-label="收起阅读进度条"
                onClick={() => {
                  onDragEnd();
                  onExpandedChange(false);
                }}
              >
                <ToggleIcon position={position} expanded />
              </button>
            </div>
          </div>
          {slider}
        </>
      )}
    </div>
  );
}
