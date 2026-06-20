import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  composeLearningRecordMarkdown,
  parseLearningRecordMarkdown,
  type LearningRecord,
} from '@profile/teach-hub-shared';

import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'RecordDetail'>;

export function RecordDetailScreen({ route, navigation }: Props) {
  const { workspaceId, relativePath, title } = route.params;
  const { teachHubApi } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [record, setRecord] = useState<LearningRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const content = await teachHubApi.fetchWorkspaceFileText(workspaceId, relativePath);
      setRecord(parseLearningRecordMarkdown(content, relativePath));
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [relativePath, teachHubApi, workspaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateSection = (index: number, content: string) => {
    if (!record) return;
    setRecord({
      ...record,
      sections: record.sections.map((section, i) =>
        i === index ? { ...section, content } : section,
      ),
    });
  };

  const handleSave = async () => {
    if (!record) return;
    setSaving(true);
    setMessage(null);
    try {
      const markdown = composeLearningRecordMarkdown(record);
      await teachHubApi.putWorkspaceFileText(workspaceId, relativePath, markdown);
      setMessage('已保存');
      setEditing(false);
      navigation.setOptions({ title: record.title || title });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="gap-2 border-b border-slate-200 bg-white p-4">
        {editing && record ? (
          <TextInput
            className="rounded-lg border border-slate-300 p-2.5 text-lg font-bold text-slate-900"
            value={record.title}
            onChangeText={(value) => setRecord({ ...record, title: value })}
          />
        ) : (
          <Text className="text-lg font-bold text-slate-900">{record?.title ?? title}</Text>
        )}
        <View className="flex-row gap-4">
          {editing ? (
            <>
              <Pressable onPress={() => void handleSave()} disabled={saving}>
                <Text className="font-bold text-blue-600">{saving ? '保存中…' : '保存'}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setEditing(false);
                  void load();
                }}
              >
                <Text className="font-semibold text-slate-500">取消</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={() => setEditing(true)}>
              <Text className="font-bold text-blue-600">编辑</Text>
            </Pressable>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator className="flex-1" />
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-3 p-6">
          <Text className="text-center text-red-600">{error}</Text>
          <Pressable className="rounded-lg bg-slate-900 px-4 py-2.5" onPress={() => void load()}>
            <Text className="font-semibold text-white">重试</Text>
          </Pressable>
        </View>
      ) : record ? (
        <ScrollView contentContainerClassName="gap-4 p-4 pb-8">
          {record.sections.length === 0 ? (
            <Text className="mt-12 text-center text-slate-500">暂无内容</Text>
          ) : (
            record.sections.map((section, index) => (
              <View
                key={`${section.heading}-${index}`}
                className="gap-2 rounded-xl border border-slate-200 bg-white p-3.5"
              >
                <Text className="text-sm font-bold text-slate-500">{section.heading}</Text>
                {editing ? (
                  <TextInput
                    className="min-h-[120px] rounded-lg border border-slate-300 bg-white p-2.5 text-[15px] leading-[22px]"
                    multiline
                    value={section.content}
                    onChangeText={(content) => updateSection(index, content)}
                    textAlignVertical="top"
                  />
                ) : (
                  <Text className="text-[15px] leading-[22px] text-slate-900">{section.content}</Text>
                )}
              </View>
            ))
          )}
          {message ? <Text className="text-center text-slate-500">{message}</Text> : null}
        </ScrollView>
      ) : null}
    </View>
  );
}
