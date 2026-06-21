import { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  RESOURCE_CATEGORY_DESCRIPTIONS,
  RESOURCE_CATEGORY_LABELS,
  composeResourcesMarkdown,
  type ResourceCategory,
  type ResourceItem,
  type ResourcesFormData,
} from '@profile/teach-hub-shared';

import { thCard, thDesc, thInput, thPrimaryBtn, thPrimaryBtnText } from '../theme';

type Props = {
  initial: ResourcesFormData;
  saving?: boolean;
  onSave: (markdown: string) => Promise<void>;
};

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type Entry = ResourceItem & { id: string };

function toEntries(items: ResourceItem[]): Entry[] {
  return items.map((item) => ({ ...item, id: nextId() }));
}

const CATEGORIES: ResourceCategory[] = ['knowledge', 'wisdom'];

export function ResourcesEditor({ initial, saving, onSave }: Props) {
  const [entries, setEntries] = useState<Entry[]>(() => toEntries(initial.items));
  const [message, setMessage] = useState<string | null>(null);

  const updateEntry = (id: string, patch: Partial<ResourceItem>) => {
    setEntries((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeEntry = (id: string) => {
    setEntries((rows) => rows.filter((row) => row.id !== id));
  };

  const addEntry = (category: ResourceCategory) => {
    setEntries((rows) => [...rows, { id: nextId(), title: '', url: '', note: '', category }]);
  };

  const handleSave = async () => {
    setMessage(null);
    try {
      const items = entries
        .map(({ id: _id, ...item }) => item)
        .filter((item) => item.title.trim());
      await onSave(composeResourcesMarkdown({ items }));
      setMessage('已保存');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '保存失败');
    }
  };

  return (
    <ScrollView contentContainerClassName="gap-4 pb-8">
      {CATEGORIES.map((category) => {
        const rows = entries.filter((e) => e.category === category);
        return (
          <View key={category} className="gap-2.5">
            <View className="flex-row justify-between gap-3">
              <View>
                <Text className="text-[15px] font-bold text-[#3d3428]">
                  {RESOURCE_CATEGORY_LABELS[category]}
                </Text>
                <Text className="mt-0.5 text-xs text-[#7a6f5c]">
                  {RESOURCE_CATEGORY_DESCRIPTIONS[category]}
                </Text>
              </View>
              <Pressable
                className="self-start rounded-md bg-[#f0ebe3] px-2.5 py-1.5"
                onPress={() => addEntry(category)}
              >
                <Text className="text-xs font-semibold text-[#6b5f4d]">+ 添加</Text>
              </Pressable>
            </View>

            {rows.length === 0 ? (
              <Text className="text-sm text-[#7a6f5c]">暂无条目</Text>
            ) : (
              rows.map((entry) => (
                <View
                  key={entry.id}
                  className={`gap-2 ${thCard}`}
                >
                  <TextInput
                    className={`${thInput} text-sm`}
                    value={entry.title}
                    onChangeText={(title) => updateEntry(entry.id, { title })}
                    placeholder="标题"
                  />
                  <TextInput
                    className={`${thInput} text-sm`}
                    value={entry.url ?? ''}
                    onChangeText={(url) => updateEntry(entry.id, { url })}
                    placeholder="URL（可选）"
                    autoCapitalize="none"
                  />
                  <TextInput
                    className={`${thInput} text-sm`}
                    value={entry.note ?? ''}
                    onChangeText={(note) => updateEntry(entry.id, { note })}
                    placeholder="备注（可选）"
                  />
                  <View className="flex-row justify-between">
                    {entry.url ? (
                      <Pressable onPress={() => void Linking.openURL(entry.url!)}>
                        <Text className="text-[13px] font-semibold text-blue-600">打开链接</Text>
                      </Pressable>
                    ) : null}
                    <Pressable onPress={() => removeEntry(entry.id)}>
                      <Text className="text-[13px] font-semibold text-red-600">删除</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      })}

      <Pressable
        className={`mt-2 items-center ${thPrimaryBtn} ${saving ? 'opacity-50' : ''}`}
        disabled={saving}
        onPress={() => void handleSave()}
      >
        <Text className={thPrimaryBtnText}>{saving ? '保存中…' : '保存资源'}</Text>
      </Pressable>
      {message ? <Text className="text-center text-[#7a6f5c]">{message}</Text> : null}
    </ScrollView>
  );
}
