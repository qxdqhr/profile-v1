import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import {
  generateLessonButtonLabel,
  resolveGenerateLessonTrigger,
  type GenerateLessonTrigger,
  type LessonIndex,
  type TeachLessonProgress,
} from '@profile/teach-hub-shared';

import { useAuth } from '../auth/AuthContext';
import { Button } from '../ui';

type Props = {
  workspaceId: string;
  lessons: LessonIndex[];
  progress: TeachLessonProgress[];
  missionReady: boolean;
  onGenerated: () => void;
  inline?: boolean;
};

export function GenerateLessonPanel({
  workspaceId,
  lessons,
  progress,
  missionReady,
  onGenerated,
  inline = false,
}: Props) {
  const { teachHubApi } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trigger = useMemo(
    (): GenerateLessonTrigger | null =>
      resolveGenerateLessonTrigger(lessons, progress, missionReady),
    [lessons, progress, missionReady],
  );

  const label = generateLessonButtonLabel(trigger, lessons.length);

  const handlePress = async () => {
    if (!trigger) return;
    setLoading(true);
    setError(null);
    try {
      const job = await teachHubApi.generateLesson(workspaceId, trigger);
      if (job.status === 'failed') {
        setError(job.errorMessage || '生成失败');
      } else {
        onGenerated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={inline ? 'min-w-[140px] flex-1' : 'mb-3 gap-1.5'}>
      <Button
        type="primary"
        size="small"
        disabled={!trigger || loading}
        loading={loading}
        onPress={() => void handlePress()}
      >
        {label}
      </Button>
      {error ? <Text className="mt-1 text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}
