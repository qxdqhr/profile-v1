import { Pressable, Text, View } from 'react-native';

type Props = {
  slugs: string[];
  onPress: (slug: string) => void;
};

export function ReferenceChips({ slugs, onPress }: Props) {
  if (slugs.length === 0) return null;

  return (
    <View className="mb-4 mt-2 gap-2">
      <Text className="text-sm font-bold text-slate-900">速查参考</Text>
      <View className="flex-row flex-wrap gap-2">
        {slugs.map((slug) => (
          <Pressable
            key={slug}
            className="rounded-2xl bg-sky-100 px-3 py-1.5"
            onPress={() => onPress(slug)}
          >
            <Text className="text-sm font-semibold text-sky-700">{slug}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
