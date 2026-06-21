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
        <Text className="text-xs text-[#9f927d]">
          {completed} / {total} 课已完成
        </Text>
        <Text className="text-xs text-[#9f927d]">{pct}%</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-[#e8e2d6]">
        <View className="h-full rounded-full bg-[#19c8b9]" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}
