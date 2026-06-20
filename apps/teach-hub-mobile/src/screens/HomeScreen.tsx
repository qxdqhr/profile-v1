import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TeachWorkspaceSummary } from '@profile/teach-hub-shared';

import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation';
import { TEACH_HUB_API_BASE_URL } from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user, isLoading: authLoading, teachHubApi, logout, refreshSession } = useAuth();
  const [items, setItems] = useState<TeachWorkspaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <View className="mb-3 gap-1.5">
        <Text className="text-xs text-slate-500">API: {TEACH_HUB_API_BASE_URL}</Text>
        {user ? (
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-slate-900">{user.name || user.email}</Text>
            <Pressable onPress={() => void logout()}>
              <Text className="text-sm font-semibold text-blue-600">退出</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text className="text-sm font-semibold text-blue-600">登录</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator className="flex-1" />
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-center text-red-600">{error}</Text>
          {!user ? (
            <Pressable
              className="rounded-lg bg-slate-900 px-4 py-2.5"
              onPress={() => navigation.navigate('Login')}
            >
              <Text className="font-semibold text-white">去登录</Text>
            </Pressable>
          ) : (
            <Pressable className="rounded-lg bg-slate-900 px-4 py-2.5" onPress={() => void load()}>
              <Text className="font-semibold text-white">重试</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text className="mt-12 text-center text-slate-500">暂无工作区</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              className="mb-3 rounded-xl border border-slate-200 bg-white p-4"
              onPress={() =>
                navigation.navigate('Workspace', {
                  workspaceId: item.id,
                  title: item.title,
                })
              }
            >
              <Text className="text-base font-semibold text-slate-900">{item.title}</Text>
              <Text className="mt-1 text-sm text-slate-500">
                {item.lessonCount} 课时 · {item.topic ?? '未设主题'}
              </Text>
            </Pressable>
          )}
        />
      )}

      {user ? (
        <Pressable className="mt-2 items-center py-2" onPress={() => void refreshSession()}>
          <Text className="text-xs text-slate-400">下拉刷新会话</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
