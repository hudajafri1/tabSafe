import React, { useEffect, useState } from "react";
import {StyleSheet, Text, View, Pressable, ScrollView, Platform, Alert,} from "react-native";
import { Medication } from "../models/Medication";
import { Schedule } from "../models/Schedule";
import PrimaryButton from "../components/PrimaryButton";
import {
  getSchedulesForMedication,
  deleteSchedule,
  toggleScheduleEnabled,
} from "../logic/scheduleLogic";

type MedicationDetailScreenProps = {
  medication: Medication;
  onBack: () => void;
  onDelete: () => void;
  onEditMedication: () => void;
  onEditSchedule: (schedule: Schedule) => void;
  onSchedule: () => void;
  refreshKey?: number;
};

export default function MedicationDetailScreen({
  medication,
  onBack,
  onDelete,
  onEditMedication,
  onEditSchedule,
  onSchedule,
  refreshKey,
}: MedicationDetailScreenProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const loadSchedules = async () => {
    const result = await getSchedulesForMedication(medication.name);
    setSchedules(result);
  };

  useEffect(() => {
    loadSchedules();
  }, [medication.name, refreshKey]);

  const confirmDeleteMedication = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${medication.name}? This action cannot be undone.`
      );
      if (confirmed) onDelete();
      return;
    }

    Alert.alert(
      "Delete Medication",
      `Are you sure you want to delete ${medication.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  const confirmDeleteSchedule = (scheduleId: string) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this reminder?"
      );
      if (confirmed) handleDeleteSchedule(scheduleId);
      return;
    }

    Alert.alert("Delete Reminder", "Are you sure you want to delete this reminder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteSchedule(scheduleId),
      },
    ]);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    await deleteSchedule(scheduleId);
    await loadSchedules();
  };

  const handleToggleSchedule = async (scheduleId: string) => {
    await toggleScheduleEnabled(scheduleId);
    await loadSchedules();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Medication Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{medication.name}</Text>

        <Text style={styles.label}>Dosage</Text>
        <Text style={styles.value}>{medication.dosage}</Text>

        <Text style={styles.label}>Frequency</Text>
        <Text style={styles.value}>{medication.frequency}</Text>

        <Text style={styles.label}>Notes</Text>
        <Text style={styles.value}>
          {medication.notes && medication.notes.trim().length > 0
            ? medication.notes
            : "No notes added."}
        </Text>
      </View>

      <PrimaryButton title="Edit Medication" onPress={onEditMedication} />
      <View style={styles.buttonSpacer} />
      <PrimaryButton title="Set Reminder" onPress={onSchedule} />

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Saved Reminders</Text>

        {schedules.length === 0 ? (
          <Text style={styles.emptyText}>No reminders saved yet.</Text>
        ) : (
          schedules.map((schedule) => (
            <View key={schedule.id} style={styles.scheduleCard}>
              <Text style={styles.scheduleTime}>{schedule.time}</Text>
              <Text style={styles.scheduleMeta}>
                {schedule.recurrence}
                {schedule.reminderLabel ? ` • ${schedule.reminderLabel}` : ""}
              </Text>
              <Text style={styles.statusText}>
                Status: {schedule.enabled ? "Enabled" : "Disabled"}
              </Text>

              <View style={styles.scheduleButtonRow}>
                <Pressable
                  style={styles.smallBlueButton}
                  onPress={() => handleToggleSchedule(schedule.id)}
                >
                  <Text style={styles.smallBlueButtonText}>
                    {schedule.enabled ? "Disable" : "Enable"}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.smallGrayButton}
                  onPress={() => onEditSchedule(schedule)}
                >
                  <Text style={styles.smallGrayButtonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={styles.smallRedButton}
                  onPress={() => confirmDeleteSchedule(schedule.id)}
                >
                  <Text style={styles.smallRedButtonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      <Pressable style={styles.deleteButton} onPress={confirmDeleteMedication}>
        <Text style={styles.deleteButtonText}>Delete Medication</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={onBack}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F7FAFC",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E3A5F",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#718096",
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3A5F",
  },
  buttonSpacer: {
    height: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3A5F",
    marginBottom: 8,
  },
  emptyText: {
    color: "#718096",
    fontSize: 14,
  },
  scheduleCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A5F",
  },
  scheduleMeta: {
    fontSize: 14,
    color: "#4A5568",
    marginTop: 2,
  },
  statusText: {
    fontSize: 13,
    color: "#718096",
    marginTop: 6,
  },
  scheduleButtonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  smallBlueButton: {
    flex: 1,
    backgroundColor: "#DBEAFE",
    paddingVertical: 10,
    borderRadius: 10,
  },
  smallBlueButtonText: {
    textAlign: "center",
    color: "#1D4ED8",
    fontWeight: "600",
  },
  smallGrayButton: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    paddingVertical: 10,
    borderRadius: 10,
  },
  smallGrayButtonText: {
    textAlign: "center",
    color: "#1E3A5F",
    fontWeight: "600",
  },
  smallRedButton: {
    flex: 1,
    backgroundColor: "#FED7D7",
    paddingVertical: 10,
    borderRadius: 10,
  },
  smallRedButtonText: {
    textAlign: "center",
    color: "#C53030",
    fontWeight: "600",
  },
  deleteButton: {
    width: "100%",
    backgroundColor: "#FED7D7",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  deleteButtonText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#C53030",
    fontSize: 16,
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "#E2E8F0",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  secondaryButtonText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#1E3A5F",
    fontSize: 16,
  },
});