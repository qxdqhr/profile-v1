import { forwardRef } from 'react';
import {
  StyleSheet,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { ai } from './tokens';

export type InputSize = 'small' | 'middle' | 'large';

type Props = TextInputProps & {
  size?: InputSize;
  multiline?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

const SIZE = {
  small: { minHeight: 32, paddingHorizontal: 14, borderRadius: 40, fontSize: 12, borderWidth: 2.5 },
  middle: { minHeight: 40, paddingHorizontal: 18, borderRadius: 50, fontSize: 14, borderWidth: 2.5 },
  large: { minHeight: 48, paddingHorizontal: 22, borderRadius: 50, fontSize: 16, borderWidth: 3 },
} as const;

export const Input = forwardRef<TextInput, Props>(function Input(
  { size = 'middle', multiline, containerStyle, inputStyle, style, ...rest },
  ref,
) {
  const sz = SIZE[size];
  return (
    <TextInput
      ref={ref}
      multiline={multiline}
      placeholderTextColor={ai.textDisabled}
      style={[
        styles.base,
        {
          minHeight: multiline ? 120 : sz.minHeight,
          paddingHorizontal: sz.paddingHorizontal,
          borderRadius: multiline ? 16 : sz.borderRadius,
          fontSize: sz.fontSize,
          borderWidth: sz.borderWidth,
        },
        containerStyle,
        inputStyle,
        style,
      ]}
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  base: {
    backgroundColor: ai.bgInput,
    borderColor: ai.borderInput,
    color: ai.textBody,
    fontWeight: '500',
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
});
