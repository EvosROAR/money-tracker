import { useEffect, useRef } from 'react';
import { Animated, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/presentation/hooks/useTheme';
import { useUiFeedbackStore } from '@/store/uiFeedbackStore';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';

const iconMap = {
  success: 'checkmark-circle' as const,
  error: 'close-circle' as const,
  info: 'information-circle' as const,
};

export const Toast = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { toast, hideToast } = useUiFeedbackStore();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    if (toast.visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver }),
      Animated.timing(translateY, { toValue: -12, duration: 180, useNativeDriver }),
    ]).start();
  }, [toast.visible, opacity, translateY, useNativeDriver]);

  if (!toast.visible) return null;

  const accentColor =
    toast.type === 'success'
      ? theme.colors.income
      : toast.type === 'error'
        ? theme.colors.error
        : theme.colors.primary;

  const hostStyle = [
    styles.host,
    Platform.OS === 'web' ? styles.hostWeb : null,
    {
      top: insets.top + 12,
      opacity,
      transform: [{ translateY }],
    },
  ];

  return (
    <Animated.View pointerEvents="box-none" style={hostStyle}>
      <Pressable
        onPress={hideToast}
        style={[
          styles.toast,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
          theme.shadows.lg,
        ]}
      >
        <View style={styles.toastRow}>
          <Ionicons name={iconMap[toast.type]} size={22} color={accentColor} style={styles.toastIcon} />
          <Text variant="body" weight="medium" style={styles.toastText}>
            {toast.message}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const ConfirmDialog = () => {
  const { theme } = useTheme();
  const { confirm, hideConfirm, resolveConfirm } = useUiFeedbackStore();

  return (
    <Modal visible={confirm.visible} transparent animationType="fade" onRequestClose={hideConfirm}>
      <Pressable style={styles.backdrop} onPress={hideConfirm}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
            theme.shadows.lg,
          ]}
        >
          <Text variant="h3" weight="bold" style={styles.dialogTitle}>
            {confirm.title}
          </Text>
          <Text variant="body" color="secondary" style={styles.dialogMessage}>
            {confirm.message}
          </Text>

          <View style={styles.actions}>
            <Button
              title={confirm.cancelText}
              variant="outline"
              onPress={hideConfirm}
              style={styles.actionBtn}
            />
            <Button
              title={confirm.confirmText}
              variant={confirm.destructive ? 'danger' : 'primary'}
              onPress={resolveConfirm}
              style={styles.actionBtn}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export const UiFeedbackHost = () => (
  <>
    <Toast />
    <ConfirmDialog />
  </>
);

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'stretch',
  },
  hostWeb: {
    position: 'fixed' as 'absolute',
  },
  toast: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
  },
  toastRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastIcon: {
    marginRight: 10,
    flexShrink: 0,
  },
  toastText: {
    flex: 1,
    flexShrink: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 18,
    padding: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dialogTitle: {
    marginBottom: 8,
  },
  dialogMessage: {
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
  },
});
