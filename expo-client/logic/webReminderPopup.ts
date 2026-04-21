// expo-client/logic/webReminderPopup.ts

import { Schedule } from "../models/Schedule";

type WebReminderCallback = (schedule: Schedule) => void;

type WebReminderResult = {
  success: boolean;
  permission: NotificationPermission;
  target?: Date;
};

const activeReminderTimers = new Map<string, number>();

function parseNextReminderDate(timeString: string): Date | null {
  const input = timeString.trim();
  const match = input.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);

  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const ampm = match[3].toUpperCase();

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  const now = new Date();
  const target = new Date();

  target.setHours(hour, minute, 0, 0);

  // If time already passed today, schedule for tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target;
}

export async function requestWebNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("[webReminderPopup] Browser notifications are not supported in this browser.");
    return "denied";
  }

  console.log("[webReminderPopup] Current Notification.permission =", Notification.permission);

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  const result = await Notification.requestPermission();
  console.log("[webReminderPopup] Permission request result =", result);
  return result;
}

export async function scheduleWebReminder(
  schedule: Schedule,
  onReminderFire?: WebReminderCallback
): Promise<WebReminderResult> {
  const permission = await requestWebNotificationPermission();

  if (permission === "denied") {
    return {
      success: false,
      permission,
    };
  }

  try {
    const target = parseNextReminderDate((schedule as any).time);

    if (!target) {
      console.warn("[webReminderPopup] Could not parse reminder time:", (schedule as any).time);
      return {
        success: false,
        permission,
      };
    }

    const delayMs = target.getTime() - Date.now();

    console.log("[webReminderPopup] Scheduling reminder:", schedule);
    console.log("[webReminderPopup] Target date =", target);
    console.log("[webReminderPopup] Delay ms =", delayMs);
    console.log("[webReminderPopup] Permission =", permission);

    if (delayMs <= 0) {
      console.warn("[webReminderPopup] Reminder time is in the past. Not scheduling.");
      return {
        success: false,
        permission,
      };
    }

    const scheduleId =
      (schedule as any).id ??
      `${target.getTime()}-${(schedule as any).medicationName ?? "reminder"}`;

    if (activeReminderTimers.has(scheduleId)) {
      const oldTimer = activeReminderTimers.get(scheduleId)!;
      clearTimeout(oldTimer);
      activeReminderTimers.delete(scheduleId);
    }

    const timerId = window.setTimeout(() => {
      console.log("[webReminderPopup] Reminder firing for schedule:", schedule);

      const privacyMode = (schedule as any).notificationPrivacyMode ?? "private";

      const title =
        privacyMode === "detailed" ? "Medication reminder" : "TabSafe reminder";

      const body =
        privacyMode === "detailed"
          ? ((schedule as any).reminderLabel?.trim()
              ? `It's time: ${(schedule as any).reminderLabel}`
              : `It's time to take ${(schedule as any).medicationName}`)
          : "It's time for your scheduled reminder.";

      if (onReminderFire) {
        onReminderFire(schedule);
      }

      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          try {
            const notif = new Notification(title, { body });
            notif.onclick = () => {
              window.focus();
            };
            console.log("[webReminderPopup] Browser notification created successfully.");
          } catch (err) {
            console.error("[webReminderPopup] Failed to create browser notification:", err);
          }
        } else {
          console.warn("[webReminderPopup] Reminder fired but Notification.permission is not granted.");
        }
      }

      activeReminderTimers.delete(scheduleId);
    }, delayMs);

    activeReminderTimers.set(scheduleId, timerId);

    return {
      success: true,
      permission,
      target,
    };
  } catch (err) {
    console.error("[webReminderPopup] Failed to schedule web reminder:", err);
    return {
      success: false,
      permission,
    };
  }
}

export function cancelWebReminder(scheduleId: string) {
  const timerId = activeReminderTimers.get(scheduleId);
  if (timerId) {
    clearTimeout(timerId);
    activeReminderTimers.delete(scheduleId);
    console.log("[webReminderPopup] Cancelled reminder:", scheduleId);
  }
}