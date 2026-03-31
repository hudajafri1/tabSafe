import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { Medication } from "../models/Medication";
import { addSchedule } from "../logic/scheduleLogic";

type ScheduleScreenProps = {
  medication: Medication;
  onBack: () => void;
};

export default function ScheduleScreen({
  medication,
  onBack,
}: ScheduleScreenProps) {
  const [time, setTime] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [reminderLabel, setReminderLabel] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const handleSaveSchedule = async () => {
    if (!time.trim() || !recurrence.trim()) return;

    await addSchedule({
      id: Date.now().toString(),
      medicationName: medication.name,
      time,
      recurrence,
      reminderLabel,
      enabled: true,
    });

    setSavedMessage("Reminder saved successfully.");
    setTime("");
    setRecurrence("");
    setReminderLabel("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule Reminder</Text>
      <Text style={styles.subtitle}>
        Set a reminder for {medication.name}
      </Text>

      <InputField
        value={time}
        onChangeText={setTime}
        placeholder="Time (e.g. 8:00 AM)"
      />

      <InputField
        value={recurrence}
        onChangeText={setRecurrence}
        placeholder="Recurrence (e.g. Daily)"
      />

      <InputField
        value={reminderLabel}
        onChangeText={setReminderLabel}
        placeholder="Custom label (optional)"
      />

      <PrimaryButton title="Save Reminder" onPress={handleSaveSchedule} />

      {savedMessage ? <Text style={styles.savedText}>{savedMessage}</Text> : null}

      <Pressable style={styles.secondaryButton} onPress={onBack}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1E3A5F",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4A5568",
    marginBottom: 24,
    textAlign: "center",
  },
  savedText: {
    color: "#2F855A",
    fontSize: 14,
    marginTop: 12,
    marginBottom: 8,
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "#E2E8F0",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#1E3A5F",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});