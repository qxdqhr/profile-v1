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
                  selected
                    ? 'font-semibold text-[#2c5282]'
                    : 'text-[#6b5f4d]'
                }`}
              >
                {tab.label}
              </Text>
              {selected ? (
                <View className="mt-1 h-0.5 rounded-full bg-[#4299e1]" />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
