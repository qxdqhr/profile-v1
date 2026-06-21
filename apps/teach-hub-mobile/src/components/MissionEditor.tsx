import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  composeMissionMarkdown,
  type MissionFormData,
} from '@profile/teach-hub-shared';

import { thDesc, thInput, thInputMultiline, thPrimaryBtn, thPrimaryBtnText } from '../theme';

type ListKey = 'successLooksLike' | 'constraints' | 'outOfScope';

const LIST_CONFIG: Array<{ key: ListKey; title: string; placeholder: string }> = [
  {
    key: 'successLooksLike',
    title: '成功标准',
    placeholder: '例如：能独立分析一段旋律的和声进行',
  },
  {
    key: 'constraints',
    title: '学习约束',
    placeholder: '例如：每课不超过 10 分钟',
  },
  {
    key: 'outOfScope',
    title: '范围外',
    placeholder: '例如：不涉及高级爵士和声',
  },
];

type Props = {
  initial: MissionFormData;
  saving?: boolean;
  onSave: (markdown: string) => Promise<void>;
};

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type ListEntry = { id: string; value: string };

function entriesFromList(items: string[]): ListEntry[] {
  const valid = items.map((item) => item.trim()).filter(Boolean);
  return valid.map((value) => ({ id: nextId(), value }));
}

function listFromEntries(entries: ListEntry[]): string[] {
  return entries.map((entry) => entry.value.trim()).filter(Boolean);
}

export function MissionEditor({ initial, saving, onSave }: Props) {
  const [why, setWhy] = useState(initial.why);
  const [lists, setLists] = useState<Record<ListKey, ListEntry[]>>(() => ({
    successLooksLike: entriesFromList(initial.successLooksLike),
    constraints: entriesFromList(initial.constraints),
    outOfScope: entriesFromList(initial.outOfScope),
  }));
  const [message, setMessage] = useState<string | null>(null);

  const updateList = (key: ListKey, entries: ListEntry[]) => {
    setLists((prev) => ({ ...prev, [key]: entries }));
  };

  const handleSave = async () => {
    setMessage(null);
    try {
      const form: MissionFormData = {
        why: why.trim(),
        successLooksLike: listFromEntries(lists.successLooksLike),
        constraints: listFromEntries(lists.constraints),
        outOfScope: listFromEntries(lists.outOfScope),
      };
      await onSave(composeMissionMarkdown(form));
      setMessage('已保存');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '保存失败');
    }
  };

  return (
    <ScrollView contentContainerClassName="gap-4 pb-8">
      <View className="gap-2">
        <Text className="text-sm font-bold text-[#3d3428]">学习动机（Why）</Text>
        <Text className="text-xs text-[#7a6f5c]">Mimo 生成课时会优先参考此内容</Text>
        <TextInput
          className={thInputMultiline}
          multiline
          value={why}
          onChangeText={setWhy}
          placeholder="你为什么想学这个主题？"
          textAlignVertical="top"
        />
      </View>

      {LIST_CONFIG.map((config) => (
        <View key={config.key} className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-[#3d3428]">{config.title}</Text>
            <Pressable
              className="rounded-md bg-[#f0ebe3] px-2.5 py-1.5"
              onPress={() =>
                updateList(config.key, [...lists[config.key], { id: nextId(), value: '' }])
              }
            >
              <Text className="text-xs font-semibold text-[#6b5f4d]">+ 添加</Text>
            </Pressable>
          </View>
          {lists[config.key].map((entry, index) => (
            <View key={entry.id} className="flex-row items-center gap-2">
              <Text className="w-7 text-xs text-[#7a6f5c]">#{index + 1}</Text>
              <TextInput
                className={`flex-1 ${thInput} text-sm`}
                value={entry.value}
                onChangeText={(value) =>
                  updateList(
                    config.key,
                    lists[config.key].map((row) =>
                      row.id === entry.id ? { ...row, value } : row,
                    ),
                  )
                }
                placeholder={config.placeholder}
              />
              <Pressable
                onPress={() =>
                  updateList(
                    config.key,
                    lists[config.key].filter((row) => row.id !== entry.id),
                  )
                }
              >
                <Text className="text-xs font-semibold text-red-600">删除</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ))}

      <Pressable
        className={`mt-2 items-center ${thPrimaryBtn} ${saving ? 'opacity-50' : ''}`}
        disabled={saving}
        onPress={() => void handleSave()}
      >
        <Text className={`text-[15px] ${thPrimaryBtnText}`}>
          {saving ? '保存中…' : '保存 Mission'}
        </Text>
      </Pressable>
      {message ? <Text className={`text-center text-sm ${thDesc}`}>{message}</Text> : null}
    </ScrollView>
  );
}
