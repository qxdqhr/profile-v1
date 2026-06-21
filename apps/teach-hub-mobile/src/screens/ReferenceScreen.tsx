import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HtmlLessonViewer } from '../components/HtmlLessonViewer';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation';
import { thSecondaryBtn, thSecondaryBtnText } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Reference'>;

export function ReferenceScreen({ route, navigation }: Props) {
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
    <View className="flex-1 bg-[#faf9f7]">
      <View className="shrink-0 flex-row items-center gap-2 border-b border-[#e8e2d6] bg-white px-4 py-2.5">
        <Pressable
          className={thSecondaryBtn}
          onPress={() => navigation.goBack()}
        >
          <Text className={thSecondaryBtnText}>← 返回</Text>
        </Pressable>
        <Text className="flex-1 text-sm font-semibold text-[#3d3428]" numberOfLines={1}>
          {displayTitle}
        </Text>
      </View>
      <HtmlLessonViewer
        html={html}
        loading={loading}
        error={error}
        onRetry={() => void load()}
        title={displayTitle}
      />
    </View>
  );
}
