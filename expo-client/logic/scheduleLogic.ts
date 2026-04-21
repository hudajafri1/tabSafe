import { Schedule } from "../models/Schedule";
import { loadVault, saveVault } from "../storage/localStore";

function parseTimeToNextOccurrence(time: string, now: Date): Date | null {
  // Expected formats like "8:00 AM" / "8:00 PM"
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
  target.setSeconds(0, 0);
  target.setHours(hours24, minutes, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target;
}

export async function addSchedule(schedule: Schedule): Promise<Schedule[]> {
  const vault = await loadVault();

  const updatedVault = {
    ...vault,
    schedules: [...vault.schedules, schedule],
  };

  await saveVault(updatedVault);

  return updatedVault.schedules;
}

export async function getSchedules(): Promise<Schedule[]> {
  const vault = await loadVault();
  return vault.schedules;
}

export async function getSchedulesForMedication(
  medicationName: string
): Promise<Schedule[]> {
  const vault = await loadVault();

  return vault.schedules.filter(
    (schedule) => schedule.medicationName === medicationName
  );
}

export async function updateSchedule(
  scheduleId: string,
  updatedFields: Partial<Schedule>
): Promise<Schedule[]> {
  const vault = await loadVault();

  const updatedVault = {
    ...vault,
    schedules: vault.schedules.map((schedule) =>
      schedule.id === scheduleId
        ? { ...schedule, ...updatedFields }
        : schedule
    ),
  };

  await saveVault(updatedVault);

  return updatedVault.schedules;
}

export async function deleteSchedule(scheduleId: string): Promise<Schedule[]> {
  const vault = await loadVault();

  const updatedVault = {
    ...vault,
    schedules: vault.schedules.filter((schedule) => schedule.id !== scheduleId),
  };

  await saveVault(updatedVault);

  return updatedVault.schedules;
}

export async function toggleScheduleEnabled(
  scheduleId: string
): Promise<Schedule[]> {
  const vault = await loadVault();

  const updatedVault = {
    ...vault,
    schedules: vault.schedules.map((schedule) =>
      schedule.id === scheduleId
        ? { ...schedule, enabled: !schedule.enabled }
        : schedule
    ),
  };

  await saveVault(updatedVault);

  return updatedVault.schedules;
}

export async function getUpcomingBannerReminder(): Promise<Schedule | null> {
  const vault = await loadVault();

  const enabledSchedules = vault.schedules.filter((schedule) => schedule.enabled);

  if (enabledSchedules.length === 0) return null;

  const now = new Date();
  const candidates = enabledSchedules
    .map((schedule) => ({
      schedule,
      next: parseTimeToNextOccurrence(schedule.time, now),
    }))
    .filter((x) => x.next !== null) as Array<{ schedule: Schedule; next: Date }>;

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.next.getTime() - b.next.getTime());
  const next = candidates[0];

  // Only show "almost time" if the next reminder is within 60 minutes.
  const minutesUntil = Math.floor((next.next.getTime() - now.getTime()) / 60000);
  if (minutesUntil < 0 || minutesUntil > 60) return null;

  return next.schedule;
}