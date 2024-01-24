export enum NotificationType {
  Cinema = 'cinema',
  Ticket = 'ticket',
  Report = 'report',
  News = 'news',
  Food = 'food',
  System = 'system',
  Other = 'other',
}

export const accountNotificationPrefix = 'notification-account';

export const notificationTypes = Object.values(NotificationType);
