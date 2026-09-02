import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import {
  RESOURCE_CATEGORY_DESCRIPTIONS,
  RESOURCE_CATEGORY_LABELS,
  composeResourcesMarkdown,
  type ResourceCategory,
  type ResourceItem,
  type ResourcesFormData,
} from '@profile/teach-hub-shared';

import { Button, Card, Input } from '../ui';

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
                <Text className="text-[15px] font-bold text-[#794f27]">
                  {RESOURCE_CATEGORY_LABELS[category]}
                </Text>
                <Text className="mt-0.5 text-xs text-[#9f927d]">
                  {RESOURCE_CATEGORY_DESCRIPTIONS[category]}
                </Text>
              </View>
              <Button type="default" size="small" onPress={() => addEntry(category)}>
                + 添加
              </Button>
            </View>

            {rows.length === 0 ? (
              <Text className="text-sm text-[#9f927d]">暂无条目</Text>
            ) : (
              rows.map((entry) => (
                <Card key={entry.id} className="gap-2">
                  <Input
                    size="small"
                    value={entry.title}
                    onChangeText={(title) => updateEntry(entry.id, { title })}
                    placeholder="标题"
                  />
                  <Input
                    size="small"
                    value={entry.url ?? ''}
                    onChangeText={(url) => updateEntry(entry.id, { url })}
                    placeholder="URL（可选）"
                    autoCapitalize="none"
                  />
                  <Input
                    size="small"
                    value={entry.note ?? ''}
                    onChangeText={(note) => updateEntry(entry.id, { note })}
                    placeholder="备注（可选）"
                  />
                  <View className="flex-row justify-between">
                    {entry.url ? (
                      <Pressable onPress={() => void Linking.openURL(entry.url!)}>
                        <Text className="text-[13px] font-semibold text-[#19c8b9]">打开链接</Text>
                      </Pressable>
                    ) : null}
                    <Pressable onPress={() => removeEntry(entry.id)}>
                      <Text className="text-[13px] font-semibold text-red-600">删除</Text>
                    </Pressable>
                  </View>
                </Card>
              ))
            )}
          </View>
        );
      })}

      <View className="mt-2 items-center">
        <Button type="primary" loading={saving} disabled={saving} onPress={() => void handleSave()}>
          {saving ? '保存中…' : '保存资源'}
        </Button>
      </View>
      {message ? <Text className="text-center text-[#9f927d]">{message}</Text> : null}
    </ScrollView>
  );
}
