export type NotificationMode = "generic" | "user-labeled";

export interface AppSettings {
  notificationsMode: NotificationMode;
  biometricEnabled: boolean;
  backupEnabled: boolean;
}