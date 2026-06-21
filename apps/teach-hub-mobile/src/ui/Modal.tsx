import type { ReactNode } from 'react';
import { Modal as RNModal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { ai } from './tokens';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  dismissOnBackdrop?: boolean;
};

/** 对齐 animal-island-ui Modal 的 RN 实现（圆角奶油色弹窗） */
export function Modal({
  visible,
  title,
  onClose,
  children,
  footer,
  dismissOnBackdrop = true,
}: Props) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={dismissOnBackdrop ? onClose : undefined}
      >
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.body}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

export function ModalCancelButton({
  onPress,
  disabled,
  label = '取消',
}: {
  onPress: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <Button type="default" size="small" disabled={disabled} onPress={onPress}>
      {label}
    </Button>
  );
}

export function ModalPrimaryButton({
  onPress,
  disabled,
  loading,
  label,
  danger,
}: {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  label: string;
  danger?: boolean;
}) {
  return (
    <Button
      type="primary"
      size="small"
      danger={danger}
      loading={loading}
      disabled={disabled}
      onPress={onPress}
    >
      {label}
    </Button>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(61, 52, 40, 0.45)',
    paddingHorizontal: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    borderRadius: 24,
    backgroundColor: ai.modalBg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: ai.borderInput,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: ai.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: ai.text,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: ai.borderLight,
  },
});
