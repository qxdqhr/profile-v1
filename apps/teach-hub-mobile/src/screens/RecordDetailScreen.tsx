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
import {
  thCard,
  thDesc,
  thInput,
  thInputMultiline,
  thPrimaryBtn,
  thPrimaryBtnText,
  thScreen,
} from '../theme';

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
    <View className={thScreen}>
      <View className="gap-2 border-b border-[#e8e2d6] bg-white p-4">
        {editing && record ? (
          <TextInput
            className={`${thInput} text-lg font-bold`}
            value={record.title}
            onChangeText={(value) => setRecord({ ...record, title: value })}
          />
        ) : (
          <Text className="text-lg font-bold text-[#3d3428]">{record?.title ?? title}</Text>
        )}
        <View className="flex-row gap-4">
          {editing ? (
            <>
              <Pressable onPress={() => void handleSave()} disabled={saving}>
                <Text className="font-bold text-[#2c5282]">{saving ? '保存中…' : '保存'}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setEditing(false);
                  void load();
                }}
              >
                <Text className="font-semibold text-[#7a6f5c]">取消</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={() => setEditing(true)}>
              <Text className="font-bold text-[#2c5282]">编辑</Text>
            </Pressable>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator className="flex-1" color="#2c5282" />
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-3 p-6">
          <Text className="text-center text-red-600">{error}</Text>
          <Pressable className={thPrimaryBtn} onPress={() => void load()}>
            <Text className={thPrimaryBtnText}>重试</Text>
          </Pressable>
        </View>
      ) : record ? (
        <ScrollView contentContainerClassName="gap-4 p-4 pb-8">
          {record.sections.length === 0 ? (
            <Text className={`mt-12 text-center ${thDesc}`}>暂无内容</Text>
          ) : (
            record.sections.map((section, index) => (
              <View key={`${section.heading}-${index}`} className={`gap-2 ${thCard}`}>
                <Text className="text-sm font-bold text-[#7a6f5c]">{section.heading}</Text>
                {editing ? (
                  <TextInput
                    className={thInputMultiline}
                    multiline
                    value={section.content}
                    onChangeText={(content) => updateSection(index, content)}
                    textAlignVertical="top"
                  />
                ) : (
                  <Text className="text-[15px] leading-[22px] text-[#3d3428]">{section.content}</Text>
                )}
              </View>
            ))
          )}
          {message ? <Text className={`text-center ${thDesc}`}>{message}</Text> : null}
        </ScrollView>
      ) : null}
    </View>
  );
}
