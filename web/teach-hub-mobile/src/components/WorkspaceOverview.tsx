import { Pressable, Text, View } from 'react-native';
import {
  lessonTitleFromSlug,
  mergeLessonsWithProgress,
  type LessonIndex,
  type TeachLessonProgress,
  type TeachWorkspace,
} from '@profile/teach-hub-shared';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GenerateLessonPanel } from './GenerateLessonPanel';
import { ProgressBar } from './ProgressBar';
import type { RootStackParamList } from '../navigation';
import { Button, Card } from '../ui';
import {
  thChip,
  thDesc,
  thLessonItem,
  thLessonItemDone,
  thPanel,
  thPanelLink,
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
      <Card className="gap-4">
        <View className="gap-2.5">
          {workspace.topic ? (
            <Text className="text-sm text-[#9f927d]">{workspace.topic}</Text>
          ) : null}
          {lessons.length > 0 ? (
            <ProgressBar completed={completed} total={lessons.length} />
          ) : (
            <Text className={thDesc}>填写 Mission 后可生成第一课</Text>
          )}
        </View>
        <View className="flex-row flex-wrap gap-2">
          {firstIncomplete ? (
            <Button
              type="primary"
              size="small"
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
              继续学习
            </Button>
          ) : lessons.length > 0 ? (
            <Button type="primary" size="small" disabled>
              全部完成
            </Button>
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
      </Card>

      <View className={thPanel}>
        <View className="mb-3 flex-row items-center justify-between gap-3">
          <Text className="text-[15px] font-bold text-[#794f27]">Mission</Text>
          <Pressable onPress={onOpenMissionTab}>
            <Text className={thPanelLink}>编辑 →</Text>
          </Pressable>
        </View>
        <Text className="text-[15px] leading-relaxed text-[#725d42]">
          {workspace.missionSummary?.trim() || '尚未填写学习动机，请先编辑 Mission。'}
        </Text>
      </View>

      <View className={thPanel}>
        <View className="mb-3 flex-row items-center justify-between gap-3">
          <Text className="text-[15px] font-bold text-[#794f27]">课时列表</Text>
          <Text className="text-sm text-[#9f927d]">{lessons.length} 课</Text>
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
                    <Text className="font-semibold text-[#794f27]">
                      {String(lesson.order).padStart(4, '0')} ·{' '}
                      {lesson.title ?? lessonTitleFromSlug(lesson.slug)}
                    </Text>
                    <Text className="mt-1 text-xs text-[#9f927d]">{lesson.slug}</Text>
                  </View>
                  <Text className="text-sm text-[#19c8b9]">
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
          <Text className="mb-3 text-[15px] font-bold text-[#794f27]">速查参考</Text>
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
                <Text className="text-sm text-[#11a89b]">{refSlug}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View className={thPanel}>
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-[15px] font-bold text-[#794f27]">阅读与导入</Text>
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
