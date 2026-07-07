import { useEffect } from 'react';
import { Platform } from 'react-native';

import {
  cancelDailyReminder,
  scheduleDailyReminder,
} from '@/application/notifications/ReminderService';
import { useSettingsStore } from '@/store/settingsStore';

export const ReminderBootstrap = () => {
  const dailyReminderEnabled = useSettingsStore((s) => s.dailyReminderEnabled);
  const dailyReminderHour = useSettingsStore((s) => s.dailyReminderHour);
  const isHydrated = useSettingsStore((s) => s.isHydrated);

  useEffect(() => {
    if (Platform.OS === 'web' || !isHydrated) return;

    void (async () => {
      try {
        if (dailyReminderEnabled) {
          await scheduleDailyReminder(dailyReminderHour);
        } else {
          await cancelDailyReminder();
        }
      } catch {
        // Permission denied or unsupported — ignore silently
      }
    })();
  }, [dailyReminderEnabled, dailyReminderHour, isHydrated]);

  return null;
};
