import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/presentation/hooks/useAuth';
import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from '@/presentation/components/ui/Text';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';

interface AccountPasswordVerifyModalProps {
  visible: boolean;
  onClose: () => void;
  onVerified: () => void;
  titleKey?: string;
  hintKey?: string;
  confirmKey?: string;
}

export const AccountPasswordVerifyModal = ({
  visible,
  onClose,
  onVerified,
  titleKey = 'settings.pinForgotTitle',
  hintKey = 'settings.pinForgotHint',
  confirmKey = 'settings.pinForgotConfirm',
}: AccountPasswordVerifyModalProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, reauthenticate, getErrorMessage } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setPassword('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleVerify = async () => {
    if (!password.trim()) {
      setError(t('settings.pinForgotPasswordRequired'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await reauthenticate(password);
      reset();
      onVerified();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
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
            {t(titleKey)}
          </Text>
          <Text variant="bodySmall" color="secondary" style={styles.hint}>
            {t(hintKey, { email: user?.email ?? '' })}
          </Text>

          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(null);
            }}
            placeholder={t('settings.pinForgotPasswordPlaceholder')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            error={error ?? undefined}
            {...(Platform.OS === 'web' ? { type: 'password' as const } : {})}
          />

          <Button
            title={t(confirmKey)}
            onPress={() => void handleVerify()}
            loading={loading}
            fullWidth
            style={styles.confirm}
          />

          <Button title={t('common.cancel')} variant="ghost" onPress={handleClose} fullWidth />
        </Pressable>
      </Pressable>
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
    gap: 4,
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
    marginBottom: 12,
    lineHeight: 20,
  },
  confirm: {
    marginTop: 16,
  },
});
