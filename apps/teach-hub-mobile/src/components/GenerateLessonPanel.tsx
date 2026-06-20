import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import {
  generateLessonButtonLabel,
  resolveGenerateLessonTrigger,
  type GenerateLessonTrigger,
  type LessonIndex,
  type TeachLessonProgress,
} from '@profile/teach-hub-shared';

import { useAuth } from '../auth/AuthContext';

type Props = {
  workspaceId: string;
  lessons: LessonIndex[];
  progress: TeachLessonProgress[];
  missionReady: boolean;
  onGenerated: () => void;
};

export function GenerateLessonPanel({
  workspaceId,
  lessons,
  progress,
  missionReady,
  onGenerated,
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
    <View className="mb-3 gap-1.5">
      <Pressable
        className={`items-center rounded-xl py-3 ${!trigger || loading ? 'bg-slate-400' : 'bg-slate-900'}`}
        disabled={!trigger || loading}
        onPress={() => void handlePress()}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-sm font-bold text-white">{label}</Text>
        )}
      </Pressable>
      {error ? <Text className="text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}
