import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private static instance: NotificationService;
  private notificationListener: any;
  private responseListener: any;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    const isExpoGo = Constants.executionEnvironment === 'storeClient';
    
    if (isExpoGo) {
      return;
    }

    await this.registerForPushNotificationsAsync();
    this.setupNotificationListeners();
    await this.scheduleInactivityReminder();
  }

  private async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('vidyank-notifications', {
        name: 'Vidyank Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#007AFF',
        sound: 'default',
        showBadge: true,
        enableLights: true,
        enableVibrate: true,
      });

      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#007AFF',
        sound: 'default',
        showBadge: true,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return;
      }
    }

    return token;
  }

  private setupNotificationListeners() {
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      // Handle notification received
    });

    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification response
    });
  }

  async showBookmarkMilestoneNotification(bookmarkCount: number) {
    const isExpoGo = Constants.executionEnvironment === 'storeClient';
    if (isExpoGo) {
      return;
    }

    const notificationContent = {
      sound: 'default',
      badge: bookmarkCount,
      data: { type: 'bookmark_milestone', count: bookmarkCount },
    };

    if (bookmarkCount === 5) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Milestone Achieved!',
          body: `Congratulations! You've bookmarked ${bookmarkCount} courses. Keep learning!`,
          ...notificationContent,
        },
        trigger: null,
      });
    } else if (bookmarkCount > 5 && bookmarkCount % 10 === 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌟 Learning Champion!',
          body: `Amazing! You've bookmarked ${bookmarkCount} courses. You're on fire!`,
          ...notificationContent,
        },
        trigger: null,
      });
    }
  }

  async scheduleInactivityReminder() {
    const isExpoGo = Constants.executionEnvironment === 'storeClient';
    if (isExpoGo) {
      return;
    }

    await this.cancelInactivityReminders();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Missing Your Learning Journey?',
        body: 'Come back and continue exploring amazing courses!',
        data: { type: 'inactivity_reminder' },
        sound: 'default',
      },
      trigger: null,
      identifier: 'inactivity_reminder',
    });
  }

  async cancelInactivityReminders() {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const inactivityReminders = scheduledNotifications.filter(
      notification => notification.identifier === 'inactivity_reminder'
    );
    
    for (const reminder of inactivityReminders) {
      await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
    }
  }

  async updateLastActiveTime() {
    const currentTime = new Date().toISOString();
    await AsyncStorage.setItem('lastActiveTime', currentTime);
    
    // Reschedule inactivity reminder
    await this.scheduleInactivityReminder();
  }

  async getLastActiveTime(): Promise<Date | null> {
    try {
      const lastActiveTime = await AsyncStorage.getItem('lastActiveTime');
      return lastActiveTime ? new Date(lastActiveTime) : null;
    } catch (error) {
      return null;
    }
  }

  cleanup() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }
}

export const notificationService = NotificationService.getInstance();