import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ai } from './tokens';

type Props = {
  active?: boolean;
  fullScreen?: boolean;
};

/** 对齐 animal-island-ui Loading */
export function Loading({ active = true, fullScreen = false }: Props) {
  if (!active) return null;

  if (fullScreen) {
    return (
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={ai.primary} />
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size="large" color={ai.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ai.bg,
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
});
