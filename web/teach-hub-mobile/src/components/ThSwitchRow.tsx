import { Switch, Text, View } from 'react-native';

import { ai } from '../ui/tokens';

type Props = {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

/** 对齐 teach-hub-core SettingsPage + animal-island-ui Switch */
export function ThSwitchRow({ title, description, value, onValueChange, disabled }: Props) {
  return (
    <View className="flex-row items-center justify-between gap-4 rounded-lg border border-[#e8e2d6] bg-[#f8f8f0] px-3 py-3">
      <View className="min-w-0 flex-1">
        <Text className="text-[15px] font-semibold text-[#794f27]">{title}</Text>
        {description ? (
          <Text className="mt-0.5 text-xs leading-relaxed text-[#9f927d]">{description}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#d4c9b4', true: ai.success }}
        thumbColor="#ffffff"
        ios_backgroundColor="#d4c9b4"
      />
    </View>
  );
}
