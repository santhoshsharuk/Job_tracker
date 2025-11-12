export interface NotificationPermissionStatus {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export class NotificationService {
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  static getPermissionStatus(): NotificationPermissionStatus {
    if (!('Notification' in window)) {
      return { granted: false, denied: true, default: false };
    }

    return {
      granted: Notification.permission === 'granted',
      denied: Notification.permission === 'denied',
      default: Notification.permission === 'default'
    };
  }

  static async showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Use service worker for notifications
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          icon: '/Job_tracker/pwa-192x192.png',
          badge: '/Job_tracker/pwa-192x192.png',
          ...options
        });
      } else {
        // Fallback to regular notifications
        new Notification(title, {
          icon: '/Job_tracker/pwa-192x192.png',
          ...options
        });
      }
    }
  }

  static async scheduleNotification(
    title: string,
    body: string,
    scheduledTime: Date
  ): Promise<void> {
    const now = new Date().getTime();
    const scheduleTime = scheduledTime.getTime();
    const delay = scheduleTime - now;

    if (delay > 0) {
      setTimeout(async () => {
        await this.showNotification(title, {
          body,
          tag: `job-reminder-${scheduledTime.getTime()}`,
          requireInteraction: true
        });
      }, delay);
    }
  }

  static async scheduleJobReminder(
    companyName: string,
    position: string,
    reminderDate: Date,
    reminderType: 'interview' | 'followup' | 'deadline'
  ): Promise<void> {
    const titles = {
      interview: '🎯 Interview Reminder',
      followup: '📧 Follow-up Reminder',
      deadline: '⏰ Application Deadline'
    };

    const bodies = {
      interview: `Interview with ${companyName} for ${position} position`,
      followup: `Time to follow up on your application to ${companyName}`,
      deadline: `Application deadline for ${position} at ${companyName}`
    };

    await this.scheduleNotification(
      titles[reminderType],
      bodies[reminderType],
      reminderDate
    );
  }
}
