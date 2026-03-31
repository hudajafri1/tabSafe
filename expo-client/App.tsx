import React, { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import AddMedicationScreen from "./screens/AddMedicationScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import MedicationDetailScreen from "./screens/MedicationDetailScreen";
import ScheduleScreen from "./screens/ScheduleScreen";
import UnlockScreen from "./screens/UnlockScreen";
import EditMedicationScreen from "./screens/EditMedicationScreen";
import EditScheduleScreen from "./screens/EditScheduleScreen";
import { Medication } from "./models/Medication";
import { Schedule } from "./models/Schedule";
import {
  addMedication,
  getMedications,
  deleteMedication,
  updateMedication,
} from "./logic/medicationLogic";
import {
  updateSchedule,
  getUpcomingBannerReminder,
} from "./logic/scheduleLogic";

type Screen =
  | "unlock"
  | "home"
  | "addMedication"
  | "history"
  | "settings"
  | "detail"
  | "schedule"
  | "editMedication"
  | "editSchedule";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("unlock");
  const [savedMeds, setSavedMeds] = useState<Medication[]>([]);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState(0);
  const [upcomingReminder, setUpcomingReminder] = useState<Schedule | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const meds = await getMedications();
      setSavedMeds(meds);

      const reminder = await getUpcomingBannerReminder();
      setUpcomingReminder(reminder);
    };

    fetchInitialData();
  }, []);

  const refreshReminderBanner = async () => {
    const reminder = await getUpcomingBannerReminder();
    setUpcomingReminder(reminder);
    setBannerDismissed(false);
  };

  const handleSaveMedication = async (
    name: string,
    dosage: string,
    frequency: string,
    notes: string
  ) => {
    const newMedication: Medication = { name, dosage, frequency, notes };
    const updatedMeds = await addMedication(newMedication);
    setSavedMeds(updatedMeds);
    setCurrentScreen("home");
  };

  const handleUpdateMedication = async (
    originalMedication: Medication,
    updatedMedication: Medication
  ) => {
    const updatedMeds = await updateMedication(originalMedication, updatedMedication);
    setSavedMeds(updatedMeds);
    setSelectedMed(updatedMedication);
    setCurrentScreen("detail");
  };

  const handleDeleteMedication = async () => {
    if (!selectedMed) return;

    const updatedMeds = await deleteMedication(selectedMed);
    setSavedMeds(updatedMeds);
    setSelectedMed(null);
    setCurrentScreen("history");
  };

  const handleUpdateSchedule = async (
    scheduleId: string,
    updatedFields: Partial<Schedule>
  ) => {
    await updateSchedule(scheduleId, updatedFields);
    setScheduleRefreshKey((prev) => prev + 1);

    if (selectedSchedule) {
      setSelectedSchedule({
        ...selectedSchedule,
        ...updatedFields,
      });
    }

    await refreshReminderBanner();
    setCurrentScreen("detail");
  };

  if (currentScreen === "unlock") {
    return <UnlockScreen onUnlock={() => setCurrentScreen("home")} />;
  }

  if (currentScreen === "addMedication") {
    return (
      <AddMedicationScreen
        onSave={handleSaveMedication}
        onBack={() => setCurrentScreen("home")}
      />
    );
  }

  if (currentScreen === "history") {
    return (
      <HistoryScreen
        savedMeds={savedMeds}
        onBack={() => setCurrentScreen("home")}
        onSelectMedication={(med) => {
          setSelectedMed(med);
          setCurrentScreen("detail");
        }}
      />
    );
  }

  if (currentScreen === "editMedication" && selectedMed) {
    return (
      <EditMedicationScreen
        medication={selectedMed}
        onSave={handleUpdateMedication}
        onBack={() => setCurrentScreen("detail")}
      />
    );
  }

  if (currentScreen === "detail" && selectedMed) {
    return (
      <MedicationDetailScreen
        medication={selectedMed}
        onBack={() => setCurrentScreen("history")}
        onDelete={handleDeleteMedication}
        onEditMedication={() => setCurrentScreen("editMedication")}
        onEditSchedule={(schedule) => {
          setSelectedSchedule(schedule);
          setCurrentScreen("editSchedule");
        }}
        onSchedule={() => setCurrentScreen("schedule")}
        refreshKey={scheduleRefreshKey}
      />
    );
  }

  if (currentScreen === "editSchedule" && selectedSchedule) {
    return (
      <EditScheduleScreen
        schedule={selectedSchedule}
        onSave={handleUpdateSchedule}
        onBack={() => setCurrentScreen("detail")}
      />
    );
  }

  if (currentScreen === "schedule" && selectedMed) {
    return (
      <ScheduleScreen
        medication={selectedMed}
        onBack={async () => {
          setScheduleRefreshKey((prev) => prev + 1);
          await refreshReminderBanner();
          setCurrentScreen("detail");
        }}
      />
    );
  }

  if (currentScreen === "settings") {
    return <SettingsScreen onBack={() => setCurrentScreen("home")} />;
  }

  return (
    <HomeScreen
      onAddMedication={() => setCurrentScreen("addMedication")}
      onViewHistory={() => setCurrentScreen("history")}
      onViewSettings={() => setCurrentScreen("settings")}
      onDismissBanner={() => setBannerDismissed(true)}
      savedMeds={savedMeds}
      upcomingReminder={bannerDismissed ? null : upcomingReminder}
    />
  );
}