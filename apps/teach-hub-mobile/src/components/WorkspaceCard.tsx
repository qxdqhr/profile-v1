import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { lessonTitleFromSlug, type TeachWorkspaceSummary } from '@profile/teach-hub-shared';

import { ProgressBar } from './ProgressBar';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation';
import { Button, Card, Modal, ModalCancelButton, ModalPrimaryButton } from '../ui';
import { thDesc } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  workspace: TeachWorkspaceSummary;
  navigation: Nav;
  onDeleted?: () => void;
};

/** 对齐 teach-hub-core WorkspaceCard */
export function WorkspaceCard({ workspace, navigation, onDeleted }: Props) {
  const { teachHubApi } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const completed = workspace.completedLessonCount ?? 0;
  const total = workspace.lessonCount || 0;
  const continueSlug = workspace.lastLessonSlug;

  const openWorkspace = () => {
    navigation.navigate('Workspace', {
      workspaceId: workspace.id,
      title: workspace.title,
    });
  };

  const openContinue = () => {
    if (continueSlug) {
      navigation.navigate('Lesson', {
        workspaceId: workspace.id,
        slug: continueSlug,
        title: lessonTitleFromSlug(continueSlug),
      });
      return;
    }
    openWorkspace();
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await teachHubApi.archiveWorkspace(workspace.id);
      setConfirmOpen(false);
      onDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card className="mb-3 gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Pressable onPress={openWorkspace}>
              <Text className="text-[17px] font-bold text-[#794f27]">{workspace.title}</Text>
            </Pressable>
            <View className="mt-1.5 flex-row flex-wrap gap-1">
              {workspace.topic ? (
                <Text className="text-[13px] text-[#9f927d]">{workspace.topic}</Text>
              ) : null}
              {workspace.topic && total > 0 ? (
                <Text className="text-[13px] text-[#9f927d]">·</Text>
              ) : null}
              <Text className="text-[13px] text-[#9f927d]">
                {total > 0 ? `${completed}/${total} 课已完成` : '尚无课时'}
              </Text>
            </View>
            {workspace.missionSummary ? (
              <Text className="mt-2 text-[14px] leading-snug text-[#725d42]" numberOfLines={2}>
                {workspace.missionSummary}
              </Text>
            ) : null}
          </View>
          {total > 0 ? (
            <View className="min-w-[100px] max-w-[140px]">
              <ProgressBar completed={completed} total={total} />
            </View>
          ) : null}
        </View>

        <View className="flex-row flex-wrap items-center gap-2 border-t border-[#f0ebe3] pt-3">
          <Button type="primary" size="small" onPress={openWorkspace}>
            进入
          </Button>
          {total > 0 ? (
            <Button type="default" size="small" onPress={openContinue}>
              继续学习
            </Button>
          ) : null}
          <Button type="text" size="small" onPress={() => setConfirmOpen(true)}>
            删除
          </Button>
        </View>
      </Card>

      <Modal
        visible={confirmOpen}
        title="删除工作区"
        onClose={() => !deleting && setConfirmOpen(false)}
        dismissOnBackdrop={!deleting}
        footer={
          <>
            <ModalCancelButton onPress={() => setConfirmOpen(false)} disabled={deleting} />
            <ModalPrimaryButton
              label="确认删除"
              danger
              loading={deleting}
              disabled={deleting}
              onPress={() => void handleDelete()}
            />
          </>
        }
      >
        <Text className="text-sm leading-relaxed text-[#725d42]">
          确定删除「{workspace.title}」？工作区将从列表中移除，OSS 中的文件仍保留。
        </Text>
        {error ? <Text className="mt-2 text-sm text-red-600">{error}</Text> : null}
      </Modal>
    </>
  );
}
