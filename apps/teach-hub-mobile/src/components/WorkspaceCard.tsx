import { Alert, Pressable, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { lessonTitleFromSlug, type TeachWorkspaceSummary } from '@profile/teach-hub-shared';

import { ProgressBar } from './ProgressBar';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation';
import {
  thBtnSmall,
  thBtnSmallSecondary,
  thBtnSmallSecondaryText,
  thBtnSmallText,
  thBtnText,
  thBtnTextLabel,
  thCard,
} from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  workspace: TeachWorkspaceSummary;
  navigation: Nav;
  onDeleted?: () => void;
};

/** 对齐 teach-hub-core WorkspaceCard */
export function WorkspaceCard({ workspace, navigation, onDeleted }: Props) {
  const { teachHubApi } = useAuth();
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

  const handleDelete = () => {
    Alert.alert(
      '删除工作区',
      `确定删除「${workspace.title}」？工作区将从列表中移除，OSS 中的文件仍保留。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认删除',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await teachHubApi.archiveWorkspace(workspace.id);
                onDeleted?.();
              } catch (err) {
                Alert.alert('删除失败', err instanceof Error ? err.message : '请稍后重试');
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <View className={`${thCard} mb-3 gap-3`}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Pressable onPress={openWorkspace}>
            <Text className="text-[17px] font-bold text-[#3d3428]">{workspace.title}</Text>
          </Pressable>
          <View className="mt-1.5 flex-row flex-wrap gap-1">
            {workspace.topic ? (
              <Text className="text-[13px] text-[#7a6f5c]">{workspace.topic}</Text>
            ) : null}
            {workspace.topic && total > 0 ? (
              <Text className="text-[13px] text-[#7a6f5c]">·</Text>
            ) : null}
            <Text className="text-[13px] text-[#7a6f5c]">
              {total > 0 ? `${completed}/${total} 课已完成` : '尚无课时'}
            </Text>
          </View>
          {workspace.missionSummary ? (
            <Text className="mt-2 text-[14px] leading-snug text-[#6b5f4d]" numberOfLines={2}>
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

      <View className="flex-row flex-wrap items-center gap-2">
        <Pressable className={thBtnSmall} onPress={openWorkspace}>
          <Text className={thBtnSmallText}>进入</Text>
        </Pressable>
        {total > 0 ? (
          <Pressable className={thBtnSmallSecondary} onPress={openContinue}>
            <Text className={thBtnSmallSecondaryText}>继续学习</Text>
          </Pressable>
        ) : null}
        <Pressable className={thBtnText} onPress={handleDelete}>
          <Text className={thBtnTextLabel}>删除</Text>
        </Pressable>
      </View>
    </View>
  );
}
