import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { Schedule } from "../models/Schedule";

type EditScheduleScreenProps = {
  schedule: Schedule;
  onSave: (scheduleId: string, updatedFields: Partial<Schedule>) => void;
  onBack: () => void;
};

export default function EditScheduleScreen({
  schedule,
  onSave,
  onBack,
}: EditScheduleScreenProps) {
  const [time, setTime] = useState(schedule.time);
  const [recurrence, setRecurrence] = useState(schedule.recurrence);
  const [reminderLabel, setReminderLabel] = useState(schedule.reminderLabel || "");

  const handleSave = () => {
    if (!time.trim() || !recurrence.trim()) return;

    onSave(schedule.id, {
      time,
      recurrence,
      reminderLabel,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Reminder</Text>
      <Text style={styles.subtitle}>
        Update reminder details below.
      </Text>

      <InputField value={time} onChangeText={setTime} placeholder="Time" />
      <InputField
        value={recurrence}
        onChangeText={setRecurrence}
        placeholder="Recurrence"
      />
      <InputField
        value={reminderLabel}
        onChangeText={setReminderLabel}
        placeholder="Custom label"
      />

      <PrimaryButton title="Save Changes" onPress={handleSave} />

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