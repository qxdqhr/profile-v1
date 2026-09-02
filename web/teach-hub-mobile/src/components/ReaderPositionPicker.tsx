import { Pressable, Text, View } from 'react-native';

import {
  LESSON_READER_POSITION_OPTIONS,
  type LessonReaderBarPosition,
} from '../hooks/useLessonReaderSettings';
import { thChip } from '../theme';

type Props = {
  value: LessonReaderBarPosition;
  onChange: (value: LessonReaderBarPosition) => void;
};

export function ReaderPositionPicker({ value, onChange }: Props) {
  return (
    <View className="gap-2">
      <Text className="text-[15px] font-semibold text-[#794f27]">进度条位置</Text>
      <View className="flex-row flex-wrap gap-2">
        {LESSON_READER_POSITION_OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              className={`${thChip} ${selected ? 'border-[#19c8b9] bg-white' : ''}`}
              onPress={() => onChange(option.value)}
            >
              <Text className={`text-sm ${selected ? 'font-semibold text-[#11a89b]' : 'text-[#11a89b]'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
