import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  lessonFilenameFromSlug,
  lessonTitleFromSlug,
  type LessonIndex,
  type TeachLessonProgress,
} from '@profile/teach-hub-shared';

import { HtmlLessonViewer } from '../components/HtmlLessonViewer';
import { ProgressBadge } from '../components/ProgressBadge';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation';
import { Button } from '../ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;

/** 对齐 teach-hub-core LessonPage */
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
    <View className="flex-1 bg-[#f8f8f0]">
      <View className="shrink-0 gap-2 border-b border-[#e8e2d6] bg-white px-4 py-2.5">
        <View className="flex-row flex-wrap items-center gap-2">
          <Button type="default" size="small" onPress={() => navigation.goBack()}>
            ← 工作区
          </Button>
          <Text className="min-w-0 flex-1 text-sm font-semibold text-[#794f27]" numberOfLines={1}>
            {currentIndex >= 0 ? `${String(lessons[currentIndex].order).padStart(4, '0')} · ` : ''}
            {displayTitle}
          </Text>
          <ProgressBadge status={currentProgress?.status} />
        </View>

        <View className="flex-row flex-wrap gap-2">
          {prev ? (
            <Button type="default" size="small" onPress={() => goLesson(prev)}>
              上一课
            </Button>
          ) : null}
          {next ? (
            <Button type="default" size="small" onPress={() => goLesson(next)}>
              下一课
            </Button>
          ) : null}
          <Button
            type="primary"
            size="small"
            disabled={marking || isCompleted}
            loading={marking}
            onPress={() => void handleMarkComplete()}
          >
            {isCompleted ? '已完成' : '标记本章完成'}
          </Button>
        </View>
        {message ? <Text className="text-xs text-[#9f927d]">{message}</Text> : null}
      </View>

      <HtmlLessonViewer
        html={html}
        loading={loading}
        error={error}
        onRetry={() => void load()}
        title={displayTitle}
      />
    </View>
  );
}
