import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { ai } from './tokens';

export type TitleColor = 'app-teal' | 'default';
export type TitleSize = 'small' | 'middle' | 'large';

type Props = {
  children: ReactNode;
  color?: TitleColor;
  size?: TitleSize;
  style?: StyleProp<ViewStyle>;
};

const COLORS: Record<TitleColor, { bg: string; text: string }> = {
  'app-teal': { bg: ai.titleTeal, text: '#fff' },
  default: { bg: ai.bgContent, text: ai.textBody },
};

const FONT_SIZE: Record<TitleSize, number> = {
  small: 15,
  middle: 18,
  large: 22,
};

/** 对齐 animal-island-ui Title 横幅标题（简化版，无 clip-path） */
export function Title({ children, color = 'app-teal', size = 'small', style }: Props) {
  const palette = COLORS[color];
  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg }, style]}>
      <Text style={[styles.text, { color: palette.text, fontSize: FONT_SIZE[size] }]} numberOfLines={2}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    maxWidth: '100%',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
