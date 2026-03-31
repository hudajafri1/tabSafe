import { Medication } from "./Medication";
import { Schedule } from "./Schedule";
import { IntakeLog } from "./IntakeLog";
import { AppSettings } from "./Settings";

export interface Vault {
  medications: Medication[];
  schedules: Schedule[];
  intakeLogs: IntakeLog[];
  settings: AppSettings;
}