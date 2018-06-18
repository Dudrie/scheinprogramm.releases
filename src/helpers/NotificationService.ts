import { System, Notification } from 'react-notification-system';

export abstract class NotificationService {
    private static notificationSystem: System | null = null;

    public static setSystem(notiSystem: System) {
        this.notificationSystem = notiSystem;
    }

    public static showNotification(notification: Notification) {
        if (!this.notificationSystem) {
            throw new Error('There is no NotificationSystem given. You have to set a system first.');
        }
        
        this.notificationSystem.addNotification(notification)
    }
}