import Slider from '@react-native-community/slider';
import { Pressable, Text, View } from 'react-native';

import {
  isVerticalReaderPosition,
  type LessonReaderBarPosition,
} from '../hooks/useLessonReaderSettings';

type Props = {
  position: LessonReaderBarPosition;
  expanded: boolean;
  percent: number;
  onPercentChange: (value: number) => void;
  onDragEnd: () => void;
  onExpandedChange: (expanded: boolean) => void;
};

function ToggleLabel({ position, expanded }: { position: LessonReaderBarPosition; expanded: boolean }) {
  if (position === 'top') return <Text className="text-base text-[#7a6f5c]">{expanded ? '▲' : '▼'}</Text>;
  if (position === 'bottom') return <Text className="text-base text-[#7a6f5c]">{expanded ? '▼' : '▲'}</Text>;
  if (position === 'left') return <Text className="text-base text-[#7a6f5c]">{expanded ? '◀' : '▶'}</Text>;
  return <Text className="text-base text-[#7a6f5c]">{expanded ? '▶' : '◀'}</Text>;
}

/** 对齐 teach-hub-core LessonReadingProgress */
export function LessonReadingProgress({
  position,
  expanded,
  percent,
  onPercentChange,
  onDragEnd,
  onExpandedChange,
}: Props) {
  const vertical = isVerticalReaderPosition(position);

  const toggleBtn = (nextExpanded: boolean, label: string) => (
    <Pressable
      className="h-7 w-7 items-center justify-center rounded-md border border-[#e8e2d6] bg-white"
      accessibilityLabel={label}
      onPress={() => {
        onDragEnd();
        onExpandedChange(nextExpanded);
      }}
    >
      <ToggleLabel position={position} expanded={nextExpanded} />
    </Pressable>
  );

  if (vertical && !expanded) {
    return (
      <View className="items-center justify-center gap-1 rounded-xl border border-[#e8e2d6]/90 bg-[#f5f0e8]/95 px-2 py-2 shadow-sm">
        <Text className="text-[10px] font-semibold text-[#3d3428]">{Math.round(percent)}%</Text>
        {toggleBtn(true, '展开阅读进度条')}
      </View>
    );
  }

  if (!expanded) {
    return (
      <View
        className={`flex-row items-center justify-between gap-2 bg-[#f5f0e8]/95 px-3 py-1.5 ${
          position === 'top' ? 'border-b border-[#e8e2d6]' : 'border-t border-[#e8e2d6]'
        }`}
      >
        <Text className="text-lg font-semibold tracking-tight text-[#3d3428]">
          {percent.toFixed(1)}%
        </Text>
        {toggleBtn(true, '展开阅读进度条')}
      </View>
    );
  }

  const slider = (
    <Slider
      minimumValue={0}
      maximumValue={100}
      step={0.1}
      value={percent}
      minimumTrackTintColor="#4a9b8e"
      maximumTrackTintColor="#e8e2d6"
      thumbTintColor="#4a9b8e"
      onValueChange={onPercentChange}
      onSlidingComplete={onDragEnd}
      style={vertical ? { width: 160, transform: [{ rotate: '-90deg' }] } : undefined}
    />
  );

  if (vertical) {
    return (
      <View className="h-full max-h-full w-14 items-center gap-2 rounded-xl border border-[#e8e2d6]/90 bg-[#f5f0e8]/95 px-2 py-3 shadow-sm">
        {toggleBtn(false, '收起阅读进度条')}
        <Text className="text-base font-semibold text-[#3d3428]">{percent.toFixed(1)}%</Text>
        <Text className="text-[10px] font-medium tracking-wide text-[#7a6f5c]">阅读进度</Text>
        <View className="h-32 items-center justify-center">{slider}</View>
      </View>
    );
  }

  return (
    <View className="bg-[#f5f0e8]/90 px-4 py-2.5">
      <View className="mb-2 flex-row items-baseline justify-between gap-3">
        <Text className="text-xs font-medium tracking-wide text-[#7a6f5c]">阅读进度</Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-semibold tracking-tight text-[#3d3428]">
            {percent.toFixed(1)}%
          </Text>
          {toggleBtn(false, '收起阅读进度条')}
        </View>
      </View>
      {slider}
    </View>
  );
}
