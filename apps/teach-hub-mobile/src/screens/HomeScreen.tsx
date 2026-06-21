import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TeachWorkspaceSummary } from '@profile/teach-hub-shared';

import { NewWorkspaceModal } from '../components/NewWorkspaceModal';
import { WorkspaceCard } from '../components/WorkspaceCard';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation';
import { Button, Loading, Title } from '../ui';
import { thDesc, thScreen, thTitle } from '../theme';

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
        <Loading />
      </View>
    );
  }

  return (
    <View className={`${thScreen} px-4 py-5`}>
      <View className="mb-5 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 gap-2">
          <Title color="app-teal" size="small">
            Teach 学习工作区
          </Title>
          <Text className={thTitle}>我的学习工作区</Text>
          <Text className={thDesc}>
            每个工作区对应一个 teach skill 主题：填写 Mission、学习课时、由 Mimo 续备下一课。
          </Text>
        </View>
        {user ? (
          <Pressable onPress={() => void logout()}>
            <Text className="text-sm font-semibold text-[#19c8b9]">退出</Text>
          </Pressable>
        ) : null}
      </View>

      {user ? (
        <View className="mb-4 flex-row items-center justify-between gap-3">
          <Text className="text-sm font-medium text-[#794f27]">{user.name || user.email}</Text>
          <Button type="primary" size="small" onPress={() => setCreateOpen(true)}>
            + 新建工作区
          </Button>
        </View>
      ) : null}

      {loading ? (
        <Loading />
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-3 px-2">
          <Text className="text-center text-red-600">{error}</Text>
          {!user ? (
            <Button type="primary" onPress={() => navigation.navigate('Login')}>
              去登录
            </Button>
          ) : (
            <Button type="primary" onPress={() => void load()}>
              重试
            </Button>
          )}
        </View>
      ) : items.length === 0 ? (
        <View className="rounded-[20px] border border-dashed border-[#c4b89e] bg-white px-4 py-12">
          <Text className="text-center text-base font-medium text-[#794f27]">还没有学习工作区</Text>
          <Text className={`mt-2 text-center ${thDesc}`}>
            创建主题（如「音乐乐理」），或导入已有 teach 工作区 zip。
          </Text>
          {user ? (
            <View className="mt-5 self-center">
              <Button type="primary" onPress={() => setCreateOpen(true)}>
                开始创建
              </Button>
            </View>
          ) : (
            <View className="mt-5 self-center">
              <Button type="default" onPress={() => navigation.navigate('Login')}>
                去登录
              </Button>
            </View>
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
          <Text className="text-xs text-[#9f927d]">轻触刷新会话</Text>
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
