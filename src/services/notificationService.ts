import { ReminderSettings } from '../types';

export const NotificationService = {
  /**
   * Request browser permission to show desktop notifications.
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications.');
      return 'denied';
    }
    return await Notification.requestPermission();
  },

  /**
   * Trigger a desktop notification immediately.
   */
  sendNotification(title: string, body: string, icon = '/favicon.svg') {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }
    try {
      new Notification(title, {
        body,
        icon,
      });
    } catch (err) {
      console.error('Failed to trigger browser notification:', err);
    }
  },

  /**
   * Trigger a test notification.
   */
  sendTest() {
    this.sendNotification(
      'NutriTrack Hatırlatıcı 🚀',
      'Harika! Bildirimleriniz başarıyla kuruldu. Sağlık dolu bir gün dileriz!'
    );
  },

  /**
   * Evaluate if a notification should be fired based on the user's settings, silent hours,
   * and the elapsed time since the last reminder.
   * Multi-tab duplication is prevented using localStorage sync.
   */
  checkAndNotify(settings?: ReminderSettings) {
    if (!settings || !settings.enabled) return;

    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();

    // Check if the current time falls inside the configured silent/sleeping window
    const start = settings.startHour;
    const end = settings.endHour;

    if (start < end) {
      // Normal active window (e.g., 08:00 to 22:00)
      if (currentHour < start || currentHour >= end) {
        return;
      }
    } else if (start > end) {
      // Overnight active window (e.g., 20:00 to 04:00)
      if (currentHour < start && currentHour >= end) {
        return;
      }
    } else {
      // start === end: no notifications at all or always active? Let's treat as always active.
    }

    const nowMs = now.getTime();
    const intervalMs = settings.intervalHours * 60 * 60 * 1000;

    // Use localStorage to coordinate alerts across multiple tabs
    const lastWater = Number(localStorage.getItem('last_notified_water') || '0');
    const lastFood = Number(localStorage.getItem('last_notified_food') || '0');

    // Water Reminder check
    if (settings.remindWater) {
      if (lastWater === 0) {
        // Initialize if it's the first time to avoid immediate spamming upon turning on
        localStorage.setItem('last_notified_water', nowMs.toString());
      } else if (nowMs - lastWater >= intervalMs) {
        localStorage.setItem('last_notified_water', nowMs.toString());
        this.sendNotification(
          '💧 Su İçme Vakti!',
          'Vücudunu susuz bırakma. Sağlığın için taze bir bardak su al!'
        );
      }
    }

    // Food Reminder check
    if (settings.remindFood) {
      if (lastFood === 0) {
        // Initialize if it's the first time
        localStorage.setItem('last_notified_food', nowMs.toString());
      } else if (nowMs - lastFood >= intervalMs) {
        localStorage.setItem('last_notified_food', nowMs.toString());
        this.sendNotification(
          '🍎 Beslenme Zamanı!',
          'Günlük makrolarını tamamlamak ve enerjini korumak için hafifçe atıştır.'
        );
      }
    }
  }
};
