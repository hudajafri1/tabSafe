import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, Platform, Alert } from "react-native";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { Medication } from "../models/Medication";
import { addSchedule } from "../logic/scheduleLogic";
import { getSettings } from "../logic/settingsLogic";
import { Schedule } from "../models/Schedule";
import { scheduleWebReminder } from "../logic/webReminderPopup";
import { scheduleDeviceReminder } from "../logic/notificationLogic";

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

  const normalizeTime = (raw: string): string | null => {
    const input = raw.trim();
    if (!input) return null;

    const m = input.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
    if (!m) return null;

    const hh = Number(m[1]);
    const mm = Number(m[2]);
    const ap = m[3].toUpperCase();

    if (!Number.isFinite(hh) || hh < 1 || hh > 12) return null;
    if (!Number.isFinite(mm) || mm < 0 || mm > 59) return null;

    return `${hh}:${String(mm).padStart(2, "0")} ${ap}`;
  };

  const handleTestBrowserNotification = async () => {
    Alert.alert("Test button clicked");

    if (Platform.OS !== "web") {
      Alert.alert("Test only", "This test button is only for web.");
      return;
    }

    if (!("Notification" in window)) {
      Alert.alert("Unsupported", "This browser does not support notifications.");
      return;
    }

    const permission = await Notification.requestPermission();
    console.log("[test] Notification.permission =", permission);
    Alert.alert("Permission", permission);

    if (permission === "granted") {
      try {
        new Notification("TabSafe test", {
          body: "If you can see this, browser notifications work.",
        });
        Alert.alert("Notification created");
      } catch (err) {
        console.error("[test] Failed to create notification:", err);
        Alert.alert("Error", String(err));
      }
    } else {
      Alert.alert("Notifications blocked", "Browser notifications are not allowed.");
    }
  };

  const handleSaveSchedule = async () => {
    if (!time.trim() || !recurrence.trim()) return;

    const normalizedTime = normalizeTime(time);
    if (!normalizedTime) {
      Alert.alert(
        "Invalid time format",
        'Please enter time like "8:00 AM" (with AM/PM).'
      );
      return;
    }

    const settings = await getSettings();

    const schedule: Schedule = {
      id: Date.now().toString(),
      medicationName: medication.name,
      time: normalizedTime,
      recurrence,
      reminderLabel,
      enabled: true,
      notificationPrivacyMode:
        settings.notificationsMode === "generic" ? "private" : "detailed",
    };

    const notificationId =
      Platform.OS === "web" ? null : await scheduleDeviceReminder(schedule);

    await addSchedule({
      ...schedule,
      notificationId: notificationId || undefined,
    });

    if (Platform.OS === "web") {
      const info = await scheduleWebReminder(schedule);

      if (!info) {
        Alert.alert("Error", "Failed to schedule web reminder.");
        return;
      }

      if (info.permission === "denied") {
        Alert.alert(
          "Notifications blocked",
          "Browser notifications are blocked for localhost. Please allow notifications in your browser settings."
        );
        return;
      }

      if (info.success && info.target) {
        setSavedMessage(`Reminder scheduled for ${info.target.toLocaleString()}`);
        setTime("");
        setRecurrence("");
        setReminderLabel("");
        return;
      }

      Alert.alert("Error", "Could not schedule reminder.");
      return;
    }

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

      {Platform.OS === "web" ? (
        <PrimaryButton
          title="Test Browser Notification"
          onPress={handleTestBrowserNotification}
        />
      ) : null}

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
    paddingHorizontal: 24,
    paddingTop: 60,
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