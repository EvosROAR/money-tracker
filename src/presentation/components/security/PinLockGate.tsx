import { useCallback, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

import { verifyPin } from '@/lib/utils/pin';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';
import { PinDigitsInput } from '@/presentation/components/ui/PinDigitsInput';
import { ForgotPinModal } from '@/presentation/components/security/ForgotPinModal';
import { useLockOnBackgroundReturn } from '@/presentation/hooks/useLockOnBackgroundReturn';

export const PinLockGate = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pinLockEnabled = useSettingsStore((s) => s.pinLockEnabled);
  const pinHash = useSettingsStore((s) => s.pinHash);
  const biometricLock = useSettingsStore((s) => s.biometricLock);
  const usePinLock =
    pinLockEnabled && pinHash && (Platform.OS === 'web' || !biometricLock);
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [forgotVisible, setForgotVisible] = useState(false);

  useLockOnBackgroundReturn(Boolean(usePinLock && isAuthenticated), () => {
    setIsLocked(true);
    setPinInput('');
    setError(null);
  });

  const unlock = useCallback(
    (pin: string = pinInput) => {
      if (!verifyPin(pin, pinHash)) {
        setError(t('settings.pinIncorrect'));
        return;
      }

      setIsLocked(false);
      setPinInput('');
      setError(null);
    },
    [pinInput, pinHash, t],
  );

  const handleForgotSuccess = () => {
    setForgotVisible(false);
    setIsLocked(false);
    setPinInput('');
    setError(null);
  };

  if (!usePinLock || !isAuthenticated || !isLocked) {
    return null;
  }

  return (
    <>
      <Modal visible transparent animationType="fade">
        <View style={[styles.overlay, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="lock-closed-outline" size={56} color={theme.colors.primary} />
          <Text variant="h2" weight="bold" style={styles.title}>
            {t('settings.pinLocked')}
          </Text>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            {t('settings.pinLockedHint')}
          </Text>

          <View style={styles.pinSection}>
            <PinDigitsInput
              value={pinInput}
              onChange={(text) => {
                setPinInput(text);
                setError(null);
              }}
              error={error ?? undefined}
              autoFocus
              onComplete={(pin) => {
                unlock(pin);
              }}
            />
          </View>

          <Button
            title={t('settings.pinUnlock')}
            onPress={() => unlock()}
            fullWidth
            style={styles.unlock}
          />

          <Pressable onPress={() => setForgotVisible(true)} style={styles.forgot}>
            <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
              {t('settings.pinForgot')}
            </Text>
          </Pressable>
        </View>
      </Modal>

      <ForgotPinModal
        visible={forgotVisible}
        onClose={() => setForgotVisible(false)}
        onSuccess={handleForgotSuccess}
      />
    </>
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
    marginBottom: 4,
  },
  pinSection: {
    width: '100%',
    maxWidth: 360,
    marginVertical: 8,
  },
  unlock: {
    maxWidth: 360,
    width: '100%',
  },
  forgot: {
    marginTop: 4,
    padding: 8,
  },
});
