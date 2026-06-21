import { Pressable, Text, View } from 'react-native';
import {
  lessonTitleFromSlug,
  mergeLessonsWithProgress,
  type LessonIndex,
  type LearningRecord,
  type TeachLessonProgress,
  type TeachWorkspace,
} from '@profile/teach-hub-shared';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GenerateLessonPanel } from './GenerateLessonPanel';
import { ProgressBar } from './ProgressBar';
import type { RootStackParamList } from '../navigation';
import {
  thCard,
  thChip,
  thDesc,
  thLessonItem,
  thLessonItemDone,
  thPanel,
  thPanelLink,
  thPrimaryBtn,
  thPrimaryBtnText,
} from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Workspace'>;

type Props = {
  workspaceId: string;
  workspace: TeachWorkspace;
  lessons: LessonIndex[];
  progress: TeachLessonProgress[];
  references: string[];
  missionReady: boolean;
  onGenerated: () => void;
  onOpenMissionTab: () => void;
  onOpenSettingsTab: () => void;
  navigation: Nav;
};

/** 对齐 teach-hub-core WorkspacePage 概览 */
export function WorkspaceOverview({
  workspaceId,
  workspace,
  lessons,
  progress,
  references,
  missionReady,
  onGenerated,
  onOpenMissionTab,
  onOpenSettingsTab,
  navigation,
}: Props) {
  const merged = mergeLessonsWithProgress(lessons, progress);
  const completed = progress.filter((p) => p.status === 'completed').length;
  const firstIncomplete = merged.find((m) => m.progress?.status !== 'completed');

  return (
    <View className="gap-4 pb-8">
      <View className={`${thPanel} gap-4`}>
        <View className="gap-2.5">
          {workspace.topic ? (
            <Text className="text-sm text-[#7a6f5c]">{workspace.topic}</Text>
          ) : null}
          {lessons.length > 0 ? (
            <ProgressBar completed={completed} total={lessons.length} />
          ) : (
            <Text className={thDesc}>填写 Mission 后可生成第一课</Text>
          )}
        </View>
        <View className="flex-row flex-wrap gap-2">
          {firstIncomplete ? (
            <Pressable
              className={thPrimaryBtn}
              onPress={() =>
                navigation.navigate('Lesson', {
                  workspaceId,
                  slug: firstIncomplete.lesson.slug,
                  title:
                    firstIncomplete.lesson.title ??
                    lessonTitleFromSlug(firstIncomplete.lesson.slug),
                })
              }
            >
              <Text className={thPrimaryBtnText}>继续学习</Text>
            </Pressable>
          ) : lessons.length > 0 ? (
            <View className={`${thPrimaryBtn} opacity-50`}>
              <Text className={thPrimaryBtnText}>全部完成</Text>
            </View>
          ) : null}
          <GenerateLessonPanel
            workspaceId={workspaceId}
            lessons={lessons}
            progress={progress}
            missionReady={missionReady}
            onGenerated={onGenerated}
            inline
          />
        </View>
      </View>

      <View className={thPanel}>
        <View className="mb-3 flex-row items-center justify-between gap-3">
          <Text className="text-[15px] font-bold text-[#5c4f3a]">Mission</Text>
          <Pressable onPress={onOpenMissionTab}>
            <Text className={thPanelLink}>编辑 →</Text>
          </Pressable>
        </View>
        <Text className="text-[15px] leading-relaxed text-[#6b5f4d]">
          {workspace.missionSummary?.trim() || '尚未填写学习动机，请先编辑 Mission。'}
        </Text>
      </View>

      <View className={thPanel}>
        <View className="mb-3 flex-row items-center justify-between gap-3">
          <Text className="text-[15px] font-bold text-[#5c4f3a]">课时列表</Text>
          <Text className="text-sm text-[#7a6f5c]">{lessons.length} 课</Text>
        </View>

        {lessons.length === 0 ? (
          <View className="px-3 py-6">
            <Text className={thDesc}>尚无课时</Text>
            <Text className={`mt-1 ${thDesc}`}>填写 Mission 后点击「开始第一课」。</Text>
          </View>
        ) : (
          <View className="gap-2.5">
            {merged.map(({ lesson, progress: p }) => {
              const done = p?.status === 'completed';
              return (
                <Pressable
                  key={lesson.slug}
                  className={`${thLessonItem} ${done ? thLessonItemDone : ''}`}
                  onPress={() =>
                    navigation.navigate('Lesson', {
                      workspaceId,
                      slug: lesson.slug,
                      title: lesson.title ?? lessonTitleFromSlug(lesson.slug),
                    })
                  }
                >
                  <View className="min-w-0 flex-1">
                    <Text className="font-semibold text-[#3d3428]">
                      {String(lesson.order).padStart(4, '0')} ·{' '}
                      {lesson.title ?? lessonTitleFromSlug(lesson.slug)}
                    </Text>
                    <Text className="mt-1 text-xs text-[#7a6f5c]">{lesson.slug}</Text>
                  </View>
                  <Text className="text-sm text-[#2c5282]">
                    {done ? '✓ 已完成' : '去学习 →'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {references.length > 0 ? (
        <View className={thPanel}>
          <Text className="mb-3 text-[15px] font-bold text-[#5c4f3a]">速查参考</Text>
          <View className="flex-row flex-wrap gap-2">
            {references.map((refSlug) => (
              <Pressable
                key={refSlug}
                className={thChip}
                onPress={() =>
                  navigation.navigate('Reference', {
                    workspaceId,
                    slug: refSlug,
                    title: `参考：${refSlug}`,
                  })
                }
              >
                <Text className="text-sm text-[#2c5282]">{refSlug}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View className={thPanel}>
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-[15px] font-bold text-[#5c4f3a]">阅读与导入</Text>
          <Pressable onPress={onOpenSettingsTab}>
            <Text className={thPanelLink}>设置 →</Text>
          </Pressable>
        </View>
        <Text className={`mt-2 ${thDesc}`}>
          阅读进度条位置、资源自动同步、zip 导入与删除工作区。
        </Text>
      </View>
    </View>
  );
}
