import { View, Text } from 'react-native';
import type { LessonProgressStatus } from '@profile/teach-hub-shared';
import { lessonProgressLabel } from '@profile/teach-hub-shared';

const STATUS_CLASS: Record<LessonProgressStatus, { box: string; text: string }> = {
  locked: { box: 'bg-slate-100', text: 'text-slate-400' },
  available: { box: 'bg-sky-100', text: 'text-sky-700' },
  in_progress: { box: 'bg-amber-100', text: 'text-amber-700' },
  completed: { box: 'bg-emerald-100', text: 'text-emerald-700' },
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
