import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { AsyncStorageService } from '@/infrastructure/storage/AsyncStorageService';
import {
  DEFAULT_CURRENCY,
  STORAGE_KEYS,
  SupportedCurrency,
  SupportedLanguage,
} from '@/lib/constants';
import { ThemeMode } from '@/theme';
import { initI18n, i18n } from '@/lib/i18n';

interface SettingsState {
  themeMode: ThemeMode | 'system';
  language: SupportedLanguage;
  currency: SupportedCurrency;
  biometricLock: boolean;
  pinLockEnabled: boolean;
  pinHash: string | null;
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  isHydrated: boolean;
  setThemeMode: (mode: ThemeMode | 'system') => void;
  setLanguage: (language: SupportedLanguage) => void;
  setCurrency: (currency: SupportedCurrency) => void;
  setBiometricLock: (enabled: boolean) => void;
  setAppPin: (hash: string) => void;
  clearAppPin: () => void;
  setDailyReminder: (enabled: boolean, hour?: number) => void;
  setHydrated: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      language: 'id',
      currency: DEFAULT_CURRENCY,
      biometricLock: false,
      pinLockEnabled: false,
      pinHash: null,
      dailyReminderEnabled: false,
      dailyReminderHour: 20,
      isHydrated: false,
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => {
        void i18n.changeLanguage(language);
        set({ language });
      },
      setCurrency: (currency) => set({ currency }),
      setBiometricLock: (biometricLock) => set({ biometricLock }),
      setAppPin: (pinHash) => set({ pinHash, pinLockEnabled: true }),
      clearAppPin: () => set({ pinHash: null, pinLockEnabled: false }),
      setDailyReminder: (dailyReminderEnabled, hour) =>
        set((state) => ({
          dailyReminderEnabled,
          dailyReminderHour: hour ?? state.dailyReminderHour,
        })),
      setHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: STORAGE_KEYS.THEME_MODE,
      storage: createJSONStorage(() => AsyncStorageService),
      partialize: (state) => ({
        themeMode: state.themeMode,
        language: state.language,
        currency: state.currency,
        biometricLock: state.biometricLock,
        pinLockEnabled: state.pinLockEnabled,
        pinHash: state.pinHash,
        dailyReminderEnabled: state.dailyReminderEnabled,
        dailyReminderHour: state.dailyReminderHour,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          initI18n(state.language);
        }
      },
    },
  ),
);

useSettingsStore.persist.onFinishHydration(() => {
  useSettingsStore.setState({ isHydrated: true });
});
