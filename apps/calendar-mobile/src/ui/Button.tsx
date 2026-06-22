import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ai } from './tokens';

export type ButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link';
export type ButtonSize = 'small' | 'middle' | 'large';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  type?: ButtonType;
  size?: ButtonSize;
  danger?: boolean;
  loading?: boolean;
  block?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const SIZE = {
  small: { minHeight: 32, paddingHorizontal: 16, borderRadius: 12, fontSize: 12 },
  middle: { minHeight: 45, paddingHorizontal: 20, borderRadius: 50, fontSize: 14 },
  large: { minHeight: 48, paddingHorizontal: 32, borderRadius: 24, fontSize: 16 },
} as const;

function resolveColors(type: ButtonType, danger: boolean, pressed: boolean, disabled: boolean) {
  const dim = disabled ? 0.5 : 1;
  const shadowDepth = pressed ? 1 : 5;

  if (type === 'primary') {
    if (danger) {
      return {
        opacity: dim,
        backgroundColor: ai.error,
        borderColor: ai.error,
        borderBottomColor: ai.errorActive,
        borderBottomWidth: 2 + shadowDepth,
        color: '#fff',
      };
    }
    return {
      opacity: dim,
      backgroundColor: '#f8f8f0',
      borderColor: '#f8f8f0',
      borderBottomColor: ai.shadowBtn,
      borderBottomWidth: 2 + shadowDepth,
      color: ai.text,
    };
  }

  if (type === 'text' || type === 'link') {
    return {
      opacity: dim,
      backgroundColor: pressed ? ai.bgSecondary : 'transparent',
      borderColor: 'transparent',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
      color: type === 'link' ? ai.primary : ai.text,
    };
  }

  return {
    opacity: dim,
    backgroundColor: pressed ? ai.bgSecondary : ai.bg,
    borderColor: pressed ? ai.primary : ai.border,
    borderBottomWidth: 2,
    borderBottomColor: pressed ? ai.primary : ai.border,
    color: pressed ? ai.primaryActive : ai.text,
  };
}

export function Button({
  type = 'default',
  size = 'middle',
  danger = false,
  loading = false,
  block = false,
  disabled,
  children,
  style,
  ...rest
}: Props) {
  const sz = SIZE[size];
  const is3d = type === 'primary';

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        block && styles.block,
        is3d && !pressed && styles.shadowWrap,
        style,
      ]}
      {...rest}
    >
      {({ pressed }) => {
        const colors = resolveColors(type, danger, pressed, Boolean(disabled || loading));
        return (
          <View
            style={[
              styles.inner,
              {
                minHeight: sz.minHeight,
                paddingHorizontal: sz.paddingHorizontal,
                borderRadius: sz.borderRadius,
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
                borderBottomColor: colors.borderBottomColor,
                borderBottomWidth: colors.borderBottomWidth,
                opacity: colors.opacity,
                transform: is3d && pressed ? [{ translateY: 2 }] : undefined,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={type === 'primary' && danger ? '#fff' : ai.primary} size="small" />
            ) : (
              <Text
                style={[
                  styles.label,
                  { fontSize: sz.fontSize, color: colors.color },
                ]}
                numberOfLines={1}
              >
                {children}
              </Text>
            )}
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: {
    alignSelf: 'stretch',
  },
  shadowWrap: {
    marginBottom: 2,
  },
  inner: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
