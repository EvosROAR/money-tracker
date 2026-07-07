import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { hashPin, isValidPin } from '@/lib/utils/pin';
import { showToast } from '@/lib/utils/confirm';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useSettingsStore } from '@/store/settingsStore';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';
import { PinDigitsInput } from '@/presentation/components/ui/PinDigitsInput';
import { AccountPasswordVerifyModal } from '@/presentation/components/security/AccountPasswordVerifyModal';

interface PinSetupModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PinSetupModal = ({ visible, onClose }: PinSetupModalProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const pinLockEnabled = useSettingsStore((s) => s.pinLockEnabled);
  const setAppPin = useSettingsStore((s) => s.setAppPin);
  const clearAppPin = useSettingsStore((s) => s.clearAppPin);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [disableVerifyVisible, setDisableVerifyVisible] = useState(false);

  const reset = () => {
    setPin('');
    setConfirmPin('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (!isValidPin(pin)) {
      setError(t('settings.pinInvalid'));
      return;
    }

    if (pin !== confirmPin) {
      setError(t('settings.pinMismatch'));
      return;
    }

    setAppPin(hashPin(pin));
    showToast(t('settings.pinEnabled'), { type: 'success' });
    handleClose();
  };

  const handleDisable = () => {
    setDisableVerifyVisible(true);
  };

  const handleDisableVerified = () => {
    clearAppPin();
    showToast(t('settings.pinDisabled'), { type: 'success' });
    setDisableVerifyVisible(false);
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
            Platform.OS === 'web' ? styles.sheetWeb : null,
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <Text variant="h3" weight="bold" style={styles.title}>
            {pinLockEnabled ? t('settings.pinChange') : t('settings.pinSetup')}
          </Text>
          <Text variant="bodySmall" color="secondary" style={styles.hint}>
            {t('settings.pinSetupHint')}
          </Text>

          <PinDigitsInput
            label={t('settings.pinLabel')}
            value={pin}
            onChange={(text) => {
              setPin(text);
              setError(null);
            }}
            autoFocus
          />

          <PinDigitsInput
            label={t('settings.pinConfirm')}
            value={confirmPin}
            onChange={(text) => {
              setConfirmPin(text);
              setError(null);
            }}
            error={error ?? undefined}
          />

          <Button title={t('common.save')} onPress={handleSave} fullWidth style={styles.save} />

          {pinLockEnabled ? (
            <Button
              title={t('settings.pinDisable')}
              variant="danger"
              onPress={handleDisable}
              fullWidth
            />
          ) : null}
        </Pressable>
      </Pressable>

      <AccountPasswordVerifyModal
        visible={disableVerifyVisible}
        onClose={() => setDisableVerifyVisible(false)}
        onVerified={handleDisableVerified}
        titleKey="settings.pinDisableVerifyTitle"
        hintKey="settings.pinDisableVerifyHint"
        confirmKey="settings.pinDisableVerifyConfirm"
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    gap: 16,
  },
  sheetWeb: {
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
    marginBottom: 24,
    borderRadius: 24,
  },
  title: {
    marginBottom: 4,
  },
  hint: {
    marginBottom: 4,
    lineHeight: 20,
  },
  save: {
    marginTop: 8,
  },
});
