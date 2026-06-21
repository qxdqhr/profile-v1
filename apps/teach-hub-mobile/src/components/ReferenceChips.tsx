import { Pressable, Text, View } from 'react-native';

import { thChip } from '../theme';

type Props = {
  slugs: string[];
  onPress: (slug: string) => void;
};

export function ReferenceChips({ slugs, onPress }: Props) {
  if (slugs.length === 0) return null;

  return (
    <View className="mb-4 mt-2 gap-2">
      <Text className="text-sm font-bold text-[#3d3428]">速查参考</Text>
      <View className="flex-row flex-wrap gap-2">
        {slugs.map((slug) => (
          <Pressable key={slug} className={thChip} onPress={() => onPress(slug)}>
            <Text className="text-sm font-semibold text-[#2c5282]">{slug}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
