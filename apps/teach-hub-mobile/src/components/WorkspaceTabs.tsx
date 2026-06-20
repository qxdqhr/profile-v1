import { Pressable, ScrollView, Text, View } from 'react-native';

export type WorkspaceTab = 'overview' | 'mission' | 'resources' | 'records';

type Props = {
  active: WorkspaceTab;
  onChange: (tab: WorkspaceTab) => void;
};

const TABS: Array<{ id: WorkspaceTab; label: string }> = [
  { id: 'overview', label: '概览' },
  { id: 'mission', label: 'Mission' },
  { id: 'resources', label: '资源' },
  { id: 'records', label: '记录' },
];

export function WorkspaceTabs({ active, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="mb-3 flex-row gap-2 pr-2"
    >
      {TABS.map((tab) => {
        const selected = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            className={`min-w-[72px] items-center rounded-lg px-3.5 py-2.5 ${
              selected ? 'bg-slate-900' : 'bg-slate-200'
            }`}
            onPress={() => onChange(tab.id)}
          >
            <Text className={`text-sm font-semibold ${selected ? 'text-white' : 'text-slate-600'}`}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
