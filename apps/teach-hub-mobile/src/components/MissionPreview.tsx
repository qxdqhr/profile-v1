import { Text, View } from 'react-native';
import type { MissionFormData } from '@profile/teach-hub-shared';

import { thDesc } from '../theme';

type Props = {
  mission: MissionFormData;
};

function BulletList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <View className="gap-1.5">
      <Text className="text-[13px] font-bold uppercase tracking-wide text-[#7a6f5c]">{title}</Text>
      {items.map((item) => (
        <Text key={item} className="text-sm leading-[21px] text-[#6b5f4d]">
          · {item}
        </Text>
      ))}
    </View>
  );
}

export function MissionPreview({ mission }: Props) {
  const hasContent =
    mission.why.trim() ||
    mission.successLooksLike.length > 0 ||
    mission.constraints.length > 0 ||
    mission.outOfScope.length > 0;

  if (!hasContent) {
    return <Text className={`mt-8 text-center ${thDesc}`}>尚未填写 Mission</Text>;
  }

  return (
    <View className="gap-4">
      {mission.why.trim() ? (
        <View className="gap-1.5">
          <Text className="text-[13px] font-bold uppercase tracking-wide text-[#7a6f5c]">Why</Text>
          <Text className="text-[15px] leading-[22px] text-[#3d3428]">{mission.why.trim()}</Text>
        </View>
      ) : null}
      <BulletList title="Success looks like" items={mission.successLooksLike} />
      <BulletList title="Constraints" items={mission.constraints} />
      <BulletList title="Out of scope" items={mission.outOfScope} />
    </View>
  );
}
