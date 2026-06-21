import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TeachWorkspaceSummary } from '@profile/teach-hub-shared';

import { NewWorkspaceModal } from '../components/NewWorkspaceModal';
import { WorkspaceCard } from '../components/WorkspaceCard';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation';
import {
  thDesc,
  thPrimaryBtn,
  thPrimaryBtnText,
  thScreen,
  thSecondaryBtn,
  thSecondaryBtnText,
  thTitle,
} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user, isLoading: authLoading, teachHubApi, logout, refreshSession } = useAuth();
  const [items, setItems] = useState<TeachWorkspaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const workspaces = await teachHubApi.fetchWorkspaces({ status: 'active' });
      setItems(workspaces);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [teachHubApi]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  if (authLoading) {
    return (
      <View className={`${thScreen} items-center justify-center`}>
        <ActivityIndicator color="#2c5282" />
      </View>
    );
  }

  return (
    <View className={`${thScreen} px-4 py-5`}>
      <View className="mb-5 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className={thTitle}>我的学习工作区</Text>
          <Text className={`mt-2 ${thDesc}`}>
            每个工作区对应一个 teach skill 主题：填写 Mission、学习课时、由 Mimo 续备下一课。
          </Text>
        </View>
        {user ? (
          <Pressable onPress={() => void logout()}>
            <Text className="text-sm font-semibold text-[#2c5282]">退出</Text>
          </Pressable>
        ) : null}
      </View>

      {user ? (
        <View className="mb-4 flex-row items-center justify-between gap-3">
          <Text className="text-sm font-medium text-[#3d3428]">{user.name || user.email}</Text>
          <Pressable className={thPrimaryBtn} onPress={() => setCreateOpen(true)}>
            <Text className={thPrimaryBtnText}>+ 新建工作区</Text>
          </Pressable>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator className="flex-1" color="#2c5282" />
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-3 px-2">
          <Text className="text-center text-red-600">{error}</Text>
          {!user ? (
            <Pressable className={thPrimaryBtn} onPress={() => navigation.navigate('Login')}>
              <Text className={thPrimaryBtnText}>去登录</Text>
            </Pressable>
          ) : (
            <Pressable className={thPrimaryBtn} onPress={() => void load()}>
              <Text className={thPrimaryBtnText}>重试</Text>
            </Pressable>
          )}
        </View>
      ) : items.length === 0 ? (
        <View className="rounded-xl border border-dashed border-[#d4c9b5] bg-white px-4 py-12">
          <Text className="text-center text-base font-medium text-[#3d3428]">还没有学习工作区</Text>
          <Text className={`mt-2 text-center ${thDesc}`}>
            创建主题（如「音乐乐理」），或导入已有 teach 工作区 zip。
          </Text>
          {user ? (
            <Pressable className={`${thPrimaryBtn} mt-5 self-center`} onPress={() => setCreateOpen(true)}>
              <Text className={thPrimaryBtnText}>开始创建</Text>
            </Pressable>
          ) : (
            <Pressable
              className={`${thSecondaryBtn} mt-5 self-center`}
              onPress={() => navigation.navigate('Login')}
            >
              <Text className={thSecondaryBtnText}>去登录</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerClassName="pb-6"
          renderItem={({ item }) => (
            <WorkspaceCard
              workspace={item}
              navigation={navigation}
              onDeleted={() => void load()}
            />
          )}
        />
      )}

      {user ? (
        <Pressable className="mt-2 items-center py-2" onPress={() => void refreshSession()}>
          <Text className="text-xs text-[#7a6f5c]">轻触刷新会话</Text>
        </Pressable>
      ) : null}

      <NewWorkspaceModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => void load()}
        navigation={navigation}
      />
    </View>
  );
}
