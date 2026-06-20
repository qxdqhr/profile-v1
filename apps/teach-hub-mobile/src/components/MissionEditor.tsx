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
        <Text className="text-sm font-bold text-slate-900">学习动机（Why）</Text>
        <Text className="text-xs text-slate-500">Mimo 生成课时会优先参考此内容</Text>
        <TextInput
          className="min-h-[120px] rounded-xl border border-slate-300 bg-white p-3 text-[15px] text-slate-900"
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
            <Text className="text-sm font-bold text-slate-900">{config.title}</Text>
            <Pressable
              className="rounded-md bg-slate-200 px-2.5 py-1.5"
              onPress={() =>
                updateList(config.key, [...lists[config.key], { id: nextId(), value: '' }])
              }
            >
              <Text className="text-xs font-semibold text-slate-700">+ 添加</Text>
            </Pressable>
          </View>
          {lists[config.key].map((entry, index) => (
            <View key={entry.id} className="flex-row items-center gap-2">
              <Text className="w-7 text-xs text-slate-500">#{index + 1}</Text>
              <TextInput
                className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm"
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
        className={`mt-2 items-center rounded-xl py-3 ${saving ? 'bg-slate-400' : 'bg-slate-900'}`}
        disabled={saving}
        onPress={() => void handleSave()}
      >
        <Text className="text-[15px] font-bold text-white">
          {saving ? '保存中…' : '保存 Mission'}
        </Text>
      </Pressable>
      {message ? <Text className="text-center text-sm text-slate-500">{message}</Text> : null}
    </ScrollView>
  );
}
