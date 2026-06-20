import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import {
  lessonFilenameFromSlug,
  lessonTitleFromSlug,
  type LessonIndex,
  type TeachLessonProgress,
} from '@profile/teach-hub-shared';

import { ProgressBadge } from '../components/ProgressBadge';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation';
import { TEACH_HUB_API_BASE_URL } from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;

export function LessonScreen({ route, navigation }: Props) {
  const { workspaceId, slug, title } = route.params;
  const { teachHubApi } = useAuth();
  const [html, setHtml] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonIndex[]>([]);
  const [progress, setProgress] = useState<TeachLessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [detail, content] = await Promise.all([
        teachHubApi.fetchWorkspaceDetail(workspaceId),
        teachHubApi.fetchWorkspaceFileText(
          workspaceId,
          `lessons/${lessonFilenameFromSlug(slug)}`,
        ),
      ]);
      setLessons(detail.lessons);
      setProgress(detail.progress);
      setHtml(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载课时失败');
      setHtml(null);
    } finally {
      setLoading(false);
    }
  }, [slug, teachHubApi, workspaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const currentIndex = useMemo(
    () => lessons.findIndex((l) => l.slug === slug),
    [lessons, slug],
  );
  const prev = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < lessons.length - 1
      ? lessons[currentIndex + 1]
      : null;
  const currentProgress = progress.find((p) => p.lessonSlug === slug);
  const isCompleted = currentProgress?.status === 'completed';
  const displayTitle = title ?? lessonTitleFromSlug(slug);

  const handleMarkComplete = async () => {
    setMarking(true);
    setMessage(null);
    try {
      const updated = await teachHubApi.updateLessonProgress(workspaceId, {
        lessonSlug: slug,
        status: 'completed',
      });
      setProgress((items) =>
        items.map((p) => (p.lessonSlug === slug ? updated : p)),
      );
      setMessage('已标记完成');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '更新失败');
    } finally {
      setMarking(false);
    }
  };

  const goLesson = (target: LessonIndex) => {
    navigation.replace('Lesson', {
      workspaceId,
      slug: target.slug,
      title: target.title ?? lessonTitleFromSlug(target.slug),
    });
  };

  return (
    <View className="flex-1 bg-white">
      <View className="gap-2 border-b border-slate-200 px-4 py-2.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-1 text-[15px] font-semibold text-slate-900" numberOfLines={1}>
            {currentIndex >= 0 ? `${String(lessons[currentIndex].order).padStart(4, '0')} · ` : ''}
            {displayTitle}
          </Text>
          <ProgressBadge status={currentProgress?.status} />
        </View>

        <View className="flex-row flex-wrap gap-2">
          <Pressable
            className={`rounded-lg border border-slate-300 bg-white px-3 py-2 ${!prev ? 'opacity-40' : ''}`}
            disabled={!prev}
            onPress={() => prev && goLesson(prev)}
          >
            <Text className={`text-[13px] font-semibold ${!prev ? 'text-slate-400' : 'text-slate-700'}`}>
              上一课
            </Text>
          </Pressable>
          <Pressable
            className={`rounded-lg border border-slate-300 bg-white px-3 py-2 ${!next ? 'opacity-40' : ''}`}
            disabled={!next}
            onPress={() => next && goLesson(next)}
          >
            <Text className={`text-[13px] font-semibold ${!next ? 'text-slate-400' : 'text-slate-700'}`}>
              下一课
            </Text>
          </Pressable>
          <Pressable
            className={`rounded-lg px-3 py-2 ${marking || isCompleted ? 'bg-slate-400' : 'bg-slate-900'}`}
            disabled={marking || isCompleted}
            onPress={() => void handleMarkComplete()}
          >
            <Text className="text-[13px] font-semibold text-white">
              {isCompleted ? '已完成' : marking ? '保存中…' : '标记完成'}
            </Text>
          </Pressable>
        </View>
        {message ? <Text className="text-xs text-slate-500">{message}</Text> : null}
      </View>

      {loading ? (
        <ActivityIndicator className="flex-1" />
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-3 p-6">
          <Text className="text-center text-red-600">{error}</Text>
          <Pressable className="rounded-lg bg-slate-900 px-4 py-2.5" onPress={() => void load()}>
            <Text className="font-semibold text-white">重试</Text>
          </Pressable>
        </View>
      ) : html ? (
        <WebView
          originWhitelist={['*']}
          source={{ html, baseUrl: `${TEACH_HUB_API_BASE_URL}/` }}
          className="flex-1"
          sharedCookiesEnabled
        />
      ) : null}
    </View>
  );
}
