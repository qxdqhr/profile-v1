import { View, Text } from 'react-native';
import type { LessonProgressStatus } from '@profile/teach-hub-shared';
import { lessonProgressLabel } from '@profile/teach-hub-shared';

const STATUS_CLASS: Record<LessonProgressStatus, { box: string; text: string }> = {
  locked: { box: 'bg-[#f0ece2]', text: 'text-[#9f927d]' },
  available: { box: 'bg-[#e6f9f6]', text: 'text-[#11a89b]' },
  in_progress: { box: 'bg-[#fef9e6]', text: 'text-[#dba90e]' },
  completed: { box: 'bg-[#f0fff4]', text: 'text-[#5a9e1e]' },
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
