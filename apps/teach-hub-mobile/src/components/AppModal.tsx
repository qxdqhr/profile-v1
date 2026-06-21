import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { thPrimaryBtn, thPrimaryBtnText, thSecondaryBtn, thSecondaryBtnText } from '../theme';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  dismissOnBackdrop?: boolean;
};

/** 近似 animal-island-ui Modal 的 RN 实现 */
export function AppModal({
  visible,
  title,
  onClose,
  children,
  footer,
  dismissOnBackdrop = true,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/40 px-4"
        onPress={dismissOnBackdrop ? onClose : undefined}
      >
        <Pressable className="max-h-[85%] w-full max-w-md rounded-xl border border-[#e8e2d6] bg-[#faf9f7] shadow-lg" onPress={() => {}}>
          <View className="border-b border-[#e8e2d6] px-5 py-4">
            <Text className="text-lg font-bold text-[#3d3428]">{title}</Text>
          </View>
          <View className="px-5 py-4">{children}</View>
          {footer ? (
            <View className="flex-row justify-end gap-2 border-t border-[#e8e2d6] px-5 py-4">
              {footer}
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
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
    <Pressable className={`${thSecondaryBtn} ${disabled ? 'opacity-50' : ''}`} disabled={disabled} onPress={onPress}>
      <Text className={thSecondaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function ModalPrimaryButton({
  onPress,
  disabled,
  loading,
  label,
}: {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  label: string;
}) {
  return (
    <Pressable
      className={`${thPrimaryBtn} ${disabled || loading ? 'opacity-50' : ''}`}
      disabled={disabled || loading}
      onPress={onPress}
    >
      <Text className={thPrimaryBtnText}>{loading ? '处理中…' : label}</Text>
    </Pressable>
  );
}
