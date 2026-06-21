import { useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  completedLessonCount,
  fetchLearningRecords,
  isMissionReady,
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

import { MissionEditor } from '../components/MissionEditor';
import { ResourcesEditor } from '../components/ResourcesEditor';
import { WorkspaceOverview } from '../components/WorkspaceOverview';
import { WorkspaceSettingsPanel } from '../components/WorkspaceSettingsPanel';
import { WorkspaceTabs, type WorkspaceTab } from '../components/WorkspaceTabs';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation';
import { Button, Card, Loading } from '../ui';
import { thDesc, thScreen } from '../theme';

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
      setReferences(
        files
          .filter((f) => f.relativePath.startsWith('reference/') && f.relativePath.endsWith('.html'))
          .map((f) => f.relativePath.replace(/^reference\//, '').replace(/\.html$/i, '')),
      );
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

  const doneCount = completedLessonCount(progress);

  return (
    <View className={`${thScreen} p-4`}>
      <Text className="text-xl font-bold text-[#794f27]">{title}</Text>
      <Text className={`mb-3 mt-1 ${thDesc}`}>
        {doneCount}/{lessons.length} 课时已完成
        {records.length > 0 ? ` · ${records.length} 条学习记录` : ''}
      </Text>

      <WorkspaceTabs active={tab} onChange={setTab} />

      {loading ? (
        <Loading />
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-center text-red-600">{error}</Text>
          <Button type="primary" onPress={() => void load()}>
            重试
          </Button>
        </View>
      ) : tab === 'overview' && workspace ? (
        <ScrollView contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
          <WorkspaceOverview
            workspaceId={workspaceId}
            workspace={workspace}
            lessons={lessons}
            progress={progress}
            references={references}
            missionReady={missionReady}
            onGenerated={() => void load()}
            onOpenMissionTab={() => setTab('mission')}
            onOpenSettingsTab={() => setTab('settings')}
            navigation={navigation}
          />
        </ScrollView>
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
            <Card
              className="mb-3"
              onPress={() =>
                navigation.navigate('RecordDetail', {
                  workspaceId,
                  relativePath: item.relativePath,
                  title: item.title,
                })
              }
            >
              <Text className="text-[15px] font-semibold text-[#794f27]">
                {String(item.order).padStart(4, '0')} · {item.title}
              </Text>
              <Text className="mt-1.5 text-xs text-[#9f927d]" numberOfLines={2}>
                {recordSummary(item)}
              </Text>
            </Card>
          )}
        />
      ) : tab === 'settings' ? (
        <WorkspaceSettingsPanel workspaceId={workspaceId} navigation={navigation} />
      ) : null}
    </View>
  );
}
