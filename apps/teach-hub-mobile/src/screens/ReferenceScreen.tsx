import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';

import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation';
import { TEACH_HUB_API_BASE_URL } from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'Reference'>;

export function ReferenceScreen({ route }: Props) {
  const { workspaceId, slug, title } = route.params;
  const { teachHubApi } = useAuth();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filename = slug.endsWith('.html') ? slug : `${slug}.html`;
      const content = await teachHubApi.fetchWorkspaceFileText(
        workspaceId,
        `reference/${filename}`,
      );
      setHtml(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载参考页失败');
      setHtml(null);
    } finally {
      setLoading(false);
    }
  }, [slug, teachHubApi, workspaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const displayTitle = title ?? `参考：${slug}`;

  return (
    <View className="flex-1 bg-white">
      <Text className="border-b border-slate-200 px-4 py-2.5 text-base font-semibold text-slate-900">
        {displayTitle}
      </Text>

      {loading ? (
        <ActivityIndicator className="flex-1" />
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-3 p-6">
          <Text className="text-center text-red-600">{error}</Text>
          <Pressable className="rounded-lg bg-slate-900 px-4 py-2.5" onPress={() => void load()}>
            <Text className="font-semibold text-white">重试</Text>
          </Pressable>
        </View>
      ) : html ? (
        <WebView
          originWhitelist={['*']}
          source={{ html, baseUrl: `${TEACH_HUB_API_BASE_URL}/` }}
          className="flex-1"
          sharedCookiesEnabled
        />
      ) : null}
    </View>
  );
}
