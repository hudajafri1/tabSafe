export type NotificationMode = "generic" | "user-labeled";

export type AppSettings = {
  biometricEnabled: boolean;
  homeView: "private" | "detailed";
  genericNotifications: boolean;
  lockSensitiveContent: boolean;
};