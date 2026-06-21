import { Pressable, ScrollView, Text, View } from 'react-native';

export type WorkspaceTab = 'overview' | 'mission' | 'resources' | 'records' | 'settings';

type Props = {
  active: WorkspaceTab;
  onChange: (tab: WorkspaceTab) => void;
};

const TABS: Array<{ id: WorkspaceTab; label: string }> = [
  { id: 'overview', label: '概览' },
  { id: 'mission', label: 'Mission' },
  { id: 'records', label: '学习记录' },
  { id: 'resources', label: '资源' },
  { id: 'settings', label: '设置' },
];

export function WorkspaceTabs({ active, onChange }: Props) {
  return (
    <View className="mb-4 border-b border-[#e8e2d6] pb-1">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row gap-1.5 pr-2"
      >
        {TABS.map((tab) => {
          const selected = tab.id === active;
          return (
            <Pressable
              key={tab.id}
              className={`rounded-t-lg px-3.5 py-2 ${
                selected ? 'bg-white shadow-sm' : 'bg-transparent'
              }`}
              onPress={() => onChange(tab.id)}
            >
              <Text
                className={`text-[15px] ${
                  selected ? 'font-semibold text-[#19c8b9]' : 'text-[#725d42]'
                }`}
              >
                {tab.label}
              </Text>
              {selected ? (
                <View className="mt-1 h-0.5 rounded-full bg-[#19c8b9]" />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
