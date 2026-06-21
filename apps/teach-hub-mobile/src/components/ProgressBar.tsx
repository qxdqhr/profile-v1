import { Text, View } from 'react-native';

type Props = {
  completed: number;
  total: number;
  className?: string;
};

/** 对齐 teach-hub-core ProgressBar */
export function ProgressBar({ completed, total, className = '' }: Props) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.min(100, Math.round((completed / safeTotal) * 100));

  return (
    <View className={className}>
      <View className="mb-1 flex-row justify-between">
        <Text className="text-xs text-[#7a6f5c]">
          {completed} / {total} 课已完成
        </Text>
        <Text className="text-xs text-[#7a6f5c]">{pct}%</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-[#eee8dc]">
        <View className="h-full rounded-full bg-[#4299e1]" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}
