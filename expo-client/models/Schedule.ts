export type NotificationPrivacyMode = "private" | "detailed";

export type Schedule = {
  id: string;
  medicationName: string;
  time: string;
  recurrence: string;
  reminderLabel?: string;
  enabled: boolean;
  notificationPrivacyMode: NotificationPrivacyMode;
  notificationId?: string;
};