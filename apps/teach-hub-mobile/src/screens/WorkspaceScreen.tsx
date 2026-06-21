import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  completedLessonCount,
  fetchLearningRecords,
  isMissionReady,
  lessonTitleFromSlug,
  listReferenceSlugs,
  mergeLessonsWithProgress,
  parseMissionMarkdown,
  parseResourcesMarkdown,
  recordSummary,
  DEFAULT_RESOURCES_MD,
  type LearningRecord,
  type MissionFormData,
  type ResourcesFormData,
  type TeachLessonProgress,
  type TeachWorkspace,
} from '@profile/teach-hub-shared';

import { GenerateLessonPanel } from '../components/GenerateLessonPanel';
import { MissionEditor } from '../components/MissionEditor';
import { ResourcesEditor } from '../components/ResourcesEditor';
import { ProgressBadge } from '../components/ProgressBadge';
import { ReferenceChips } from '../components/ReferenceChips';
import { WorkspaceTabs, type WorkspaceTab } from '../components/WorkspaceTabs';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation';
import {
  thCardPressable,
  thDesc,
  thPrimaryBtn,
  thPrimaryBtnText,
  thScreen,
  thTitle,
} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Workspace'>;

type LessonRow = { order: number; slug: string; filename: string; title?: string };

export function WorkspaceScreen({ route, navigation }: Props) {
  const { workspaceId, title } = route.params;
  const { teachHubApi } = useAuth();
  const [tab, setTab] = useState<WorkspaceTab>('overview');
  const [workspace, setWorkspace] = useState<TeachWorkspace | null>(null);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [progress, setProgress] = useState<TeachLessonProgress[]>([]);
  const [mission, setMission] = useState<MissionFormData | null>(null);
  const [resources, setResources] = useState<ResourcesFormData | null>(null);
  const [references, setReferences] = useState<string[]>([]);
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingMission, setSavingMission] = useState(false);
  const [savingResources, setSavingResources] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [detail, missionMd, resourcesMd, files, learningRecords] = await Promise.all([
        teachHubApi.fetchWorkspaceDetail(workspaceId),
        teachHubApi.fetchWorkspaceFileText(workspaceId, 'MISSION.md').catch(() => ''),
        teachHubApi.fetchWorkspaceFileText(workspaceId, 'RESOURCES.md').catch(() => DEFAULT_RESOURCES_MD),
        teachHubApi.fetchWorkspaceFiles(workspaceId),
        fetchLearningRecords(teachHubApi, workspaceId).catch(() => [] as LearningRecord[]),
      ]);
      setWorkspace(detail.workspace);
      setLessons(detail.lessons);
      setProgress(detail.progress);
      setMission(parseMissionMarkdown(missionMd));
      setResources(parseResourcesMarkdown(resourcesMd));
      setReferences(listReferenceSlugs(files));
      setRecords(learningRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [teachHubApi, workspaceId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const missionReady = useMemo(() => {
    if (mission) return isMissionReady(mission);
    return Boolean(workspace?.missionSummary?.trim());
  }, [mission, workspace?.missionSummary]);

  const handleSaveMission = async (markdown: string) => {
    setSavingMission(true);
    try {
      await teachHubApi.putWorkspaceFileText(workspaceId, 'MISSION.md', markdown);
      setMission(parseMissionMarkdown(markdown));
      await load();
    } finally {
      setSavingMission(false);
    }
  };

  const handleSaveResources = async (markdown: string) => {
    setSavingResources(true);
    try {
      await teachHubApi.putWorkspaceFileText(workspaceId, 'RESOURCES.md', markdown);
      setResources(parseResourcesMarkdown(markdown));
    } finally {
      setSavingResources(false);
    }
  };

  const merged = mergeLessonsWithProgress(lessons, progress);
  const doneCount = completedLessonCount(progress);

  const listHeader = (
    <>
      <GenerateLessonPanel
        workspaceId={workspaceId}
        lessons={lessons}
        progress={progress}
        missionReady={missionReady}
        onGenerated={() => void load()}
      />
      <ReferenceChips
        slugs={references}
        onPress={(slug) =>
          navigation.navigate('Reference', {
            workspaceId,
            slug,
            title: `参考：${slug}`,
          })
        }
      />
    </>
  );

  return (
    <View className={`${thScreen} p-4`}>
      <Text className={thTitle}>{title}</Text>
      <Text className={`mb-3 mt-1 ${thDesc}`}>
        {doneCount}/{lessons.length} 课时已完成
        {records.length > 0 ? ` · ${records.length} 条学习记录` : ''}
      </Text>

      <WorkspaceTabs active={tab} onChange={setTab} />

      {loading ? (
        <ActivityIndicator className="flex-1" color="#2c5282" />
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-center text-red-600">{error}</Text>
          <Pressable className={thPrimaryBtn} onPress={() => void load()}>
            <Text className={thPrimaryBtnText}>重试</Text>
          </Pressable>
        </View>
      ) : tab === 'mission' ? (
        mission ? (
          <MissionEditor
            initial={mission}
            saving={savingMission}
            onSave={handleSaveMission}
          />
        ) : null
      ) : tab === 'resources' ? (
        resources ? (
          <ResourcesEditor
            initial={resources}
            saving={savingResources}
            onSave={handleSaveResources}
          />
        ) : null
      ) : tab === 'records' ? (
        <FlatList
          data={records}
          keyExtractor={(item) => item.relativePath}
          ListEmptyComponent={
            <Text className={`mt-12 px-3 text-center leading-5 ${thDesc}`}>
              尚无学习记录。完成课时或生成新课后会出现。
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              className={thCardPressable}
              onPress={() =>
                navigation.navigate('RecordDetail', {
                  workspaceId,
                  relativePath: item.relativePath,
                  title: item.title,
                })
              }
            >
              <Text className="text-[15px] font-semibold text-[#3d3428]">
                {String(item.order).padStart(4, '0')} · {item.title}
              </Text>
              <Text className="mt-1.5 text-xs text-[#7a6f5c]" numberOfLines={2}>
                {recordSummary(item)}
              </Text>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          data={merged}
          keyExtractor={(item) => item.lesson.slug}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={<Text className={`mt-12 text-center ${thDesc}`}>暂无课时</Text>}
          renderItem={({ item }) => (
            <Pressable
              className={thCardPressable}
              onPress={() =>
                navigation.navigate('Lesson', {
                  workspaceId,
                  slug: item.lesson.slug,
                  title: item.lesson.title ?? lessonTitleFromSlug(item.lesson.slug),
                })
              }
            >
              <View className="flex-row items-center justify-between gap-2">
                <Text className="flex-1 text-[15px] font-semibold text-[#3d3428]">
                  {String(item.lesson.order).padStart(4, '0')} ·{' '}
                  {item.lesson.title ?? lessonTitleFromSlug(item.lesson.slug)}
                </Text>
                <ProgressBadge status={item.progress?.status} />
              </View>
              <Text className="mt-1.5 text-xs text-[#7a6f5c]">{item.lesson.slug}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
