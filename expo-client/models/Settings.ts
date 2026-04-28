export type NotificationMode = "generic" | "user-labeled";

export type AppSettings = {
  biometricEnabled: boolean;
  backupEnabled: boolean;
  notificationsMode: NotificationMode;
  privacyAwayEnabled: boolean;
  darkModeEnabled: boolean;
};