import { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';

import {
  downloadBackupJson,
  exportBackup,
  parseBackupFile,
  restoreBackup,
} from '@/application/backup/BackupService';
import { ScreenContainer } from '@/presentation/components/layout/ScreenContainer';
import { Card } from '@/presentation/components/ui/Card';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';
import { OptionPickerModal } from '@/presentation/components/settings/OptionPickerModal';
import { PinSetupModal } from '@/presentation/components/settings/PinSetupModal';
import {
  cancelDailyReminder,
  scheduleDailyReminder,
} from '@/application/notifications/ReminderService';
import {
  SettingsMenuRow,
  SettingsSectionHeader,
} from '@/presentation/components/settings/SettingsMenuRow';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useSettingsStore } from '@/store/settingsStore';
import { useProfile } from '@/presentation/hooks/useProfile';
import { useExchangeRates } from '@/presentation/hooks/useExchangeRates';
import {
  BASE_CURRENCY,
  CURRENCY_LABELS,
  CURRENCY_SYMBOLS,
  LANGUAGE_FLAGS,
  SUPPORTED_CURRENCIES,
  SupportedCurrency,
  SupportedLanguage,
} from '@/lib/constants';
import { confirmAction, showToast } from '@/lib/utils/confirm';
import { SettingsStackParamList } from '@/presentation/navigation/types';
import { ThemeMode } from '@/theme';

type NavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'SettingsMain'>;
type PickerType = 'theme' | 'language' | 'currency' | null;
type ThemeOption = ThemeMode | 'system';

const getThemeValueIcon = (mode: ThemeOption): keyof typeof Ionicons.glyphMap => {
  if (mode === 'dark') return 'moon';
  if (mode === 'light') return 'sunny';
  return 'settings-sharp';
};

const getCurrencySubtitle = (
  code: SupportedCurrency,
  t: (key: string, options?: Record<string, string>) => string,
): string => {
  if (code === BASE_CURRENCY) return t('settings.currencyBase');
  return t('settings.currencyPair', { target: code });
};

export const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const { theme, themeMode, setThemeMode } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const {
    language,
    currency,
    setLanguage,
    biometricLock,
    setBiometricLock,
    pinLockEnabled,
    dailyReminderEnabled,
    dailyReminderHour,
    setDailyReminder,
  } = useSettingsStore();
  const { updateProfile } = useProfile();
  const { date, isLive } = useExchangeRates();

  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [activePicker, setActivePicker] = useState<PickerType>(null);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [currencySaving, setCurrencySaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initials = (user?.displayName ?? '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const themeValueIcon = getThemeValueIcon(themeMode);

  const languageLabel = language === 'id' ? t('settings.languageId') : t('settings.languageEn');

  const currencyOptions = useMemo(
    () =>
      SUPPORTED_CURRENCIES.map((code) => ({
        value: code,
        label: `${CURRENCY_SYMBOLS[code]} — ${CURRENCY_LABELS[code][language]}`,
        subtitle: getCurrencySubtitle(code, t),
      })),
    [language, t],
  );

  const themeOptions = useMemo(
    () => [
      { value: 'system' as ThemeOption, label: t('settings.themeSystem') },
      { value: 'light' as ThemeOption, label: t('settings.themeLight') },
      { value: 'dark' as ThemeOption, label: t('settings.themeDark') },
    ],
    [t],
  );

  const languageOptions = useMemo(
    () => [
      { value: 'id' as SupportedLanguage, label: `${LANGUAGE_FLAGS.id} ${t('settings.languageId')}` },
      { value: 'en' as SupportedLanguage, label: `${LANGUAGE_FLAGS.en} ${t('settings.languageEn')}` },
    ],
    [t],
  );

  const handleThemeSelect = (mode: ThemeOption) => {
    setThemeMode(mode);
    void updateProfile({ theme: mode }).catch(() => {
      showToast(t('common.error'), { type: 'error' });
    });
  };

  const handleLanguageSelect = (next: SupportedLanguage) => {
    setLanguage(next);
    void i18n.changeLanguage(next);
  };

  const handleCurrencySelect = (next: SupportedCurrency) => {
    if (next === currency) return;

    void (async () => {
      try {
        setCurrencySaving(true);
        await updateProfile({ currency: next });
        showToast(t('settings.currencyUpdated'), { type: 'success' });
      } catch {
        showToast(t('common.error'), { type: 'error' });
      } finally {
        setCurrencySaving(false);
      }
    })();
  };

  const handleBiometricToggle = () => {
    if (Platform.OS === 'web') return;

    void (async () => {
      if (biometricLock) {
        setBiometricLock(false);
        showToast(t('settings.biometricDisabled'), { type: 'success' });
        return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        showToast(t('settings.biometricUnavailable'), { type: 'error' });
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('settings.biometricPrompt'),
        cancelLabel: t('common.cancel'),
      });

      if (!result.success) return;

      setBiometricLock(true);
      showToast(t('settings.biometricEnabled'), { type: 'success' });
    })();
  };

  const handleReminderToggle = () => {
    if (Platform.OS === 'web') return;

    void (async () => {
      try {
        setReminderLoading(true);

        if (dailyReminderEnabled) {
          await cancelDailyReminder();
          setDailyReminder(false);
          showToast(t('settings.reminderDisabled'), { type: 'success' });
          return;
        }

        await scheduleDailyReminder(dailyReminderHour);
        setDailyReminder(true);
        showToast(t('settings.reminderEnabled'), { type: 'success' });
      } catch {
        showToast(t('settings.reminderPermissionDenied'), { type: 'error' });
      } finally {
        setReminderLoading(false);
      }
    })();
  };

  const invalidateAll = async () => {
    await queryClient.invalidateQueries();
  };

  const handleBackup = async () => {
    try {
      setBackupLoading(true);
      const data = await exportBackup();
      if (Platform.OS === 'web') {
        downloadBackupJson(data);
      }
      showToast(t('settings.backupSuccess'), { type: 'success', duration: 5000 });
    } catch {
      showToast(t('settings.backupError'), { type: 'error', duration: 5000 });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreFile = async (text: string) => {
    try {
      setRestoreLoading(true);
      const parsed = parseBackupFile(text);
      await restoreBackup(parsed);
      await invalidateAll();
      showToast(t('settings.restoreSuccess'), { type: 'success', duration: 5000 });
    } catch {
      showToast(t('settings.restoreError'), { type: 'error', duration: 5000 });
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleRestorePress = () => {
    if (Platform.OS !== 'web') return;

    confirmAction(
      t('common.confirm'),
      t('settings.restoreConfirm'),
      () => {
        fileInputRef.current?.click();
      },
      {
        confirmText: t('settings.restore'),
        cancelText: t('common.cancel'),
        destructive: true,
      },
    );
  };

  const handleLogout = () => {
    confirmAction(
      t('common.confirm'),
      t('settings.logoutConfirm'),
      () => void logout(),
      {
        confirmText: t('auth.logout'),
        cancelText: t('common.cancel'),
        destructive: true,
      },
    );
  };

  const rateFooter = isLive
    ? t('settings.exchangeRateLive', { date })
    : t('settings.exchangeRateFallback');

  return (
    <ScreenContainer scrollable>
      <Text variant="h1" weight="bold" style={styles.title}>
        {t('settings.title')}
      </Text>

      <Pressable
        onPress={() => navigation.navigate('Profile')}
        style={({ pressed }) => [
          styles.profileCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.9 : 1,
          },
          theme.shadows.md,
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: `${theme.colors.primary}22` }]}>
          <Text variant="h3" weight="bold" style={{ color: theme.colors.primary }}>
            {initials}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text variant="h3" weight="bold" numberOfLines={1}>
            {user?.displayName}
          </Text>
          <Text variant="bodySmall" color="secondary" numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </Pressable>

      <SettingsSectionHeader title={t('settings.sectionPreferences')} />
      <Card style={styles.card}>
        <SettingsMenuRow
          isFirst
          icon="color-palette-outline"
          label={t('settings.appearance')}
          valueContent={
            <Ionicons name={themeValueIcon} size={18} color={theme.colors.textSecondary} />
          }
          onPress={() => setActivePicker('theme')}
          iconColor={theme.colors.primary}
        />
        <SettingsMenuRow
          icon="language-outline"
          label={t('settings.language')}
          valueContent={
            <Text style={styles.flagEmoji}>{LANGUAGE_FLAGS[language]}</Text>
          }
          subtitle={languageLabel}
          onPress={() => setActivePicker('language')}
          iconColor="#3B82F6"
        />
        <SettingsMenuRow
          icon="cash-outline"
          label={t('settings.currency')}
          valueContent={
            <Text variant="caption" weight="bold" color="secondary">
              {CURRENCY_SYMBOLS[currency]}
            </Text>
          }
          subtitle={getCurrencySubtitle(currency, t)}
          onPress={() => setActivePicker('currency')}
          loading={currencySaving}
          iconColor="#F59E0B"
        />
        {Platform.OS !== 'web' && (
          <SettingsMenuRow
            icon="finger-print-outline"
            label={t('settings.biometricLock')}
            value={biometricLock ? t('common.on') : t('common.off')}
            subtitle={t('settings.biometricLockHint')}
            onPress={handleBiometricToggle}
            iconColor="#6366F1"
          />
        )}
      </Card>

      <SettingsSectionHeader title={t('settings.sectionSecurity')} />
      <Card style={styles.card}>
        <SettingsMenuRow
          isFirst
          icon="lock-closed-outline"
          label={t('settings.pinLock')}
          value={pinLockEnabled ? t('common.on') : t('common.off')}
          subtitle={t('settings.pinLockHint')}
          onPress={() => setPinModalVisible(true)}
          iconColor={pinLockEnabled ? '#10B981' : '#9CA3AF'}
          active={pinLockEnabled}
        />
        {Platform.OS !== 'web' && (
          <SettingsMenuRow
            icon="notifications-outline"
            label={t('settings.dailyReminder')}
            value={dailyReminderEnabled ? t('settings.reminderAt', { hour: dailyReminderHour }) : t('common.off')}
            subtitle={t('settings.dailyReminderHint')}
            onPress={handleReminderToggle}
            loading={reminderLoading}
            iconColor="#F97316"
          />
        )}
      </Card>

      <SettingsSectionHeader title={t('settings.sectionAccount')} />
      <Card style={styles.card}>
        <SettingsMenuRow
          isFirst
          icon="grid-outline"
          label={t('settings.categories')}
          onPress={() => navigation.navigate('CategoryList')}
          iconColor="#8B5CF6"
        />
      </Card>

      <SettingsSectionHeader title={t('settings.sectionData')} />
      <Card style={styles.card}>
        <SettingsMenuRow
          isFirst
          icon="cloud-download-outline"
          label={t('settings.backup')}
          onPress={() => void handleBackup()}
          loading={backupLoading}
          iconColor="#10B981"
        />
        {Platform.OS === 'web' && (
          <SettingsMenuRow
            icon="cloud-upload-outline"
            label={t('settings.restore')}
            onPress={handleRestorePress}
            loading={restoreLoading}
            iconColor="#EF4444"
          />
        )}
      </Card>

      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const text = reader.result;
              if (typeof text === 'string') {
                void handleRestoreFile(text);
              }
            };
            reader.readAsText(file);
            event.target.value = '';
          }}
        />
      )}

      <Button
        title={t('auth.logout')}
        variant="outline"
        onPress={handleLogout}
        fullWidth
        style={styles.logout}
      />

      <OptionPickerModal
        visible={activePicker === 'theme'}
        title={t('settings.selectAppearance')}
        options={themeOptions}
        selected={themeMode}
        onSelect={handleThemeSelect}
        onClose={() => setActivePicker(null)}
      />

      <OptionPickerModal
        visible={activePicker === 'language'}
        title={t('settings.selectLanguage')}
        options={languageOptions}
        selected={language}
        onSelect={handleLanguageSelect}
        onClose={() => setActivePicker(null)}
      />

      <OptionPickerModal
        visible={activePicker === 'currency'}
        title={t('settings.selectCurrency')}
        options={currencyOptions}
        selected={currency}
        onSelect={handleCurrencySelect}
        onClose={() => setActivePicker(null)}
        footer={rateFooter}
      />

      <PinSetupModal visible={pinModalVisible} onClose={() => setPinModalVisible(false)} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  card: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  flagEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },
  logout: {
    marginTop: 24,
    marginBottom: 8,
  },
});
