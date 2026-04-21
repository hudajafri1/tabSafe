import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { Schedule } from "../models/Schedule";

function parseTimeToNextOccurrence(time: string, now: Date): Date | null {
  const parts = time.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const timePart = parts[0];
  const modifier = parts[1].toUpperCase();
  if (modifier !== "AM" && modifier !== "PM") return null;

  const [hhRaw, mmRaw] = timePart.split(":");
  const hours12 = Number(hhRaw);
  const minutes = Number(mmRaw);
  if (!Number.isFinite(hours12) || !Number.isFinite(minutes)) return null;
  if (hours12 < 1 || hours12 > 12) return null;
  if (minutes < 0 || minutes > 59) return null;

  let hours24 = hours12;
  if (modifier === "PM" && hours24 !== 12) hours24 += 12;
  if (modifier === "AM" && hours24 === 12) hours24 = 0;

  const target = new Date(now);
  target.setHours(hours24, minutes, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleDeviceReminder(
  schedule: Schedule
): Promise<string | null> {
  if (Platform.OS === "web") return null;
  if (!schedule.enabled) return null;

  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  const next = parseTimeToNextOccurrence(schedule.time, new Date());
  if (!next) return null;

  const label =
    schedule.reminderLabel && schedule.reminderLabel.trim().length > 0
      ? schedule.reminderLabel.trim()
      : schedule.medicationName;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "TabSafe reminder",
      body: `It's time: ${label}`,
      sound: true,
    },
    trigger: next,
  });

  return id;
}

export async function cancelDeviceReminder(
  notificationId?: string
): Promise<void> {
  if (Platform.OS === "web") return;
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

