export interface Schedule {
  id: string;
  medicationName: string;
  time: string;
  recurrence: string;
  reminderLabel?: string;
  enabled: boolean;
  notificationId?: string;
}