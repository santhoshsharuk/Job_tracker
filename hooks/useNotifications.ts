import { useEffect, useCallback, useRef } from 'react';
import { Application } from '../types';
import { NotificationService } from '../services/notificationService';

export const useNotifications = (applications: Application[]) => {
  const checkedReminders = useRef<Set<string>>(new Set());
  const notificationCheckInterval = useRef<NodeJS.Timeout | null>(null);

  const requestNotificationPermission = useCallback(async () => {
    const permission = await NotificationService.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem('notificationPermissionRequested', 'true');
    }
    return permission;
  }, []);

  const checkAndScheduleReminders = useCallback(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    applications.forEach(app => {
      if (!app.reminderDate) return;

      const reminderKey = `${app.id}-${app.reminderDate}`;
      if (checkedReminders.current.has(reminderKey)) return;

      const reminderDateTime = new Date(app.reminderDate + 'T09:00:00');
      
      // Check if reminder is today and hasn't been shown yet
      if (reminderDateTime >= todayStart && reminderDateTime < todayEnd) {
        const notificationShown = localStorage.getItem(`notification-shown-${reminderKey}`);
        
        if (!notificationShown) {
          // Show notification immediately if it's today
          NotificationService.showNotification(
            '📋 Job Application Reminder',
            {
              body: `${app.position} at ${app.company}${app.reminderNote ? ` - ${app.reminderNote}` : ''}`,
              tag: reminderKey,
              requireInteraction: true,
              data: { applicationId: app.id }
            }
          ).then(() => {
            localStorage.setItem(`notification-shown-${reminderKey}`, 'true');
            checkedReminders.current.add(reminderKey);
          });
        } else {
          checkedReminders.current.add(reminderKey);
        }
      } 
      // Schedule future reminders
      else if (reminderDateTime > now) {
        NotificationService.scheduleNotification(
          '📋 Job Application Reminder',
          `${app.position} at ${app.company}${app.reminderNote ? ` - ${app.reminderNote}` : ''}`,
          reminderDateTime
        );
        checkedReminders.current.add(reminderKey);
      }
    });
  }, [applications]);

  useEffect(() => {
    // Request permission on first load if not already requested
    const permissionRequested = localStorage.getItem('notificationPermissionRequested');
    if (!permissionRequested && 'Notification' in window) {
      // Delay the request slightly to avoid interrupting user experience
      setTimeout(() => {
        requestNotificationPermission();
      }, 3000);
    }

    // Check reminders immediately
    if (Notification.permission === 'granted') {
      checkAndScheduleReminders();
    }

    // Set up periodic checking (every 30 minutes)
    notificationCheckInterval.current = setInterval(() => {
      if (Notification.permission === 'granted') {
        checkAndScheduleReminders();
      }
    }, 30 * 60 * 1000);

    return () => {
      if (notificationCheckInterval.current) {
        clearInterval(notificationCheckInterval.current);
      }
    };
  }, [checkAndScheduleReminders, requestNotificationPermission]);

  // Clear checked reminders cache when applications change
  useEffect(() => {
    // Clean up old notification records (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('notification-shown-')) {
        const dateMatch = key.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch) {
          const notificationDate = new Date(dateMatch[0] + 'T00:00:00');
          if (notificationDate < sevenDaysAgo) {
            localStorage.removeItem(key);
          }
        }
      }
    });
  }, [applications]);

  return {
    requestNotificationPermission,
    checkAndScheduleReminders
  };
};
