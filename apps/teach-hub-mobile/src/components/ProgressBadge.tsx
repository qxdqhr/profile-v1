import { View, Text } from 'react-native';
import type { LessonProgressStatus } from '@profile/teach-hub-shared';
import { lessonProgressLabel } from '@profile/teach-hub-shared';

const STATUS_CLASS: Record<LessonProgressStatus, { box: string; text: string }> = {
  locked: { box: 'bg-[#f0ebe3]', text: 'text-[#7a6f5c]' },
  available: { box: 'bg-[#f0f4f8]', text: 'text-[#2c5282]' },
  in_progress: { box: 'bg-[#fef3c7]', text: 'text-[#92400e]' },
  completed: { box: 'bg-[#f0fff4]', text: 'text-[#276749]' },
};

type Props = {
  status?: LessonProgressStatus;
};

export function ProgressBadge({ status = 'available' }: Props) {
  const palette = STATUS_CLASS[status] ?? STATUS_CLASS.available;
  return (
    <View className={`self-start rounded-md px-2 py-0.5 ${palette.box}`}>
      <Text className={`text-xs font-semibold ${palette.text}`}>
        {lessonProgressLabel(status)}
      </Text>
    </View>
  );
}
