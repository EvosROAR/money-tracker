import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_ID = 'daily-expense-reminder';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleDailyReminder = async (hour: number, minute = 0): Promise<void> => {
  if (Platform.OS === 'web') return;

  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);

  const granted = await requestNotificationPermission();
  if (!granted) {
    throw new Error('Notification permission denied');
  }

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'PocketLedger',
      body: 'Jangan lupa catat pengeluaran hari ini 💰',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
};

export const cancelDailyReminder = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
};
