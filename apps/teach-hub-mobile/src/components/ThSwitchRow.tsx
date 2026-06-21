import { Switch, Text, View } from 'react-native';

type Props = {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

/** 对齐 teach-hub-core thSettingsSwitchRow */
export function ThSwitchRow({ title, description, value, onValueChange, disabled }: Props) {
  return (
    <View className="flex-row items-center justify-between gap-4 rounded-lg border border-[#e8e2d6] bg-[#faf9f7] px-3 py-3">
      <View className="min-w-0 flex-1">
        <Text className="text-[15px] font-semibold text-[#3d3428]">{title}</Text>
        {description ? (
          <Text className="mt-0.5 text-xs leading-relaxed text-[#7a6f5c]">{description}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#e8e2d6', true: '#4299e1' }}
        thumbColor="#ffffff"
      />
    </View>
  );
}
