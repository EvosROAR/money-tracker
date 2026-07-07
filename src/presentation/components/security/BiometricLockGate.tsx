import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Platform, StyleSheet, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/presentation/hooks/useTheme';
import { useLockOnBackgroundReturn } from '@/presentation/hooks/useLockOnBackgroundReturn';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';

export const BiometricLockGate = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const biometricLock = useSettingsStore((s) => s.biometricLock);
  const [isLocked, setIsLocked] = useState(false);
  const hasPromptedOnce = useRef(false);

  useLockOnBackgroundReturn(
    Platform.OS !== 'web' && biometricLock && isAuthenticated,
    () => setIsLocked(true),
  );

  const unlock = useCallback(async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      setIsLocked(false);
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t('settings.biometricPrompt'),
      cancelLabel: t('common.cancel'),
      disableDeviceFallback: false,
    });

    if (result.success) {
      setIsLocked(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isLocked || Platform.OS === 'web') return;

    if (!hasPromptedOnce.current) {
      hasPromptedOnce.current = true;
    }

    void unlock();
  }, [isLocked, unlock]);

  if (Platform.OS === 'web' || !biometricLock || !isAuthenticated || !isLocked) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="finger-print-outline" size={56} color={theme.colors.primary} />
        <Text variant="h2" weight="bold" style={styles.title}>
          {t('settings.biometricLocked')}
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          {t('settings.biometricLockedHint')}
        </Text>
        <Button title={t('settings.biometricUnlock')} onPress={() => void unlock()} fullWidth />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
});
