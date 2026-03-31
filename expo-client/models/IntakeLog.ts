export type IntakeStatus = "taken" | "missed" | "skipped";

export interface IntakeLog {
  id: string;
  medicationName: string;
  timestamp: number;
  status: IntakeStatus;
  note?: string;
}