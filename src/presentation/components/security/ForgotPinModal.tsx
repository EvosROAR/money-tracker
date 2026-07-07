import { useTranslation } from 'react-i18next';

import { showToast } from '@/lib/utils/confirm';
import { useSettingsStore } from '@/store/settingsStore';
import { AccountPasswordVerifyModal } from '@/presentation/components/security/AccountPasswordVerifyModal';

interface ForgotPinModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ForgotPinModal = ({ visible, onClose, onSuccess }: ForgotPinModalProps) => {
  const { t } = useTranslation();
  const clearAppPin = useSettingsStore((s) => s.clearAppPin);

  return (
    <AccountPasswordVerifyModal
      visible={visible}
      onClose={onClose}
      onVerified={() => {
        clearAppPin();
        showToast(t('settings.pinForgotSuccess'), { type: 'success' });
        onSuccess();
      }}
    />
  );
};
