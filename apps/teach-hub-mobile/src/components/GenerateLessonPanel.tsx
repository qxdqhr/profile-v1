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
  /** 嵌入概览面板时不额外加外边距 */
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
      <Pressable
        className={`items-center rounded-lg px-4 py-2.5 ${!trigger || loading ? 'bg-[#7a6f5c]' : 'bg-[#2c5282] active:opacity-90'}`}
        disabled={!trigger || loading}
        onPress={() => void handlePress()}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-sm font-semibold text-white">{label}</Text>
        )}
      </Pressable>
      {error ? <Text className="mt-1 text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}
