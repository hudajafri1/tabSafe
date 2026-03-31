import { Schedule } from "../models/Schedule";
import { loadVault, saveVault } from "../storage/localStore";

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

  // For now, return the first enabled reminder as a simple frontend prototype.
  // Later this can be replaced with real time comparison logic.
  return enabledSchedules[0];
}