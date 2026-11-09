import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { dueForecast } from './scheduler';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const CHANNEL = 'review-reminders';

export const ensurePermission = async () => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Review reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
};

const messageFor = (count) =>
  count === 1
    ? 'One lesson is waiting for a quick check-in.'
    : `${count} lessons are waiting for a quick check-in.`;

/**
 * A repeating notification can't carry a dynamic count, so we schedule one
 * notification per day for the next week using the forecast of due lessons,
 * and rebuild the schedule whenever data or settings change.
 */
export const rescheduleReminders = async (mistakes, settings) => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!settings.notificationsEnabled) return;
    const granted = await ensurePermission();
    if (!granted) return;

    const [hh, mm] = (settings.notificationTime || '20:00').split(':').map(Number);
    const now = new Date();
    const forecast = dueForecast(mistakes, 7, now);

    for (const { date, count } of forecast) {
      if (count === 0) continue;
      const fireAt = new Date(date);
      fireAt.setHours(hh, mm, 0, 0);
      if (fireAt <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Oopsy review time', body: messageFor(count) },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireAt,
          channelId: CHANNEL,
        },
      });
    }
  } catch (e) {
    console.warn('Could not schedule reminders', e);
  }
};
