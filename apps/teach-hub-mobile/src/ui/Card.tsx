import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { ai } from './tokens';

type Props = {
  children: ReactNode;
  onPress?: PressableProps['onPress'];
  className?: string;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
};

/** 对齐 animal-island-ui Card（default 奶油色容器） */
export function Card({ children, onPress, className, style, padded = true }: Props) {
  const content = (
    <View
      className={className}
      style={[styles.card, padded && styles.padded, style]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: ai.bgContent,
    borderWidth: 0,
  },
  padded: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ translateY: -1 }],
  },
});
