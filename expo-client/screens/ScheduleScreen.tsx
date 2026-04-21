import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Modal,
  Alert,
  Platform,
} from "react-native";
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

const HOURS = ["1","2","3","4","5","6","7","8","9","10","11","12"];
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ScheduleScreen({
  medication,
  onBack,
}: ScheduleScreenProps) {
  const [selectedHour, setSelectedHour] = useState("8");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");

  const [recurrence, setRecurrence] = useState("");
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [reminderLabel, setReminderLabel] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showCustomDaysModal, setShowCustomDaysModal] = useState(false);

  const recurrenceOptions = ["Daily", "Weekdays", "As Needed", "Custom Days"];

  const timeString = useMemo(
    () => `${selectedHour}:${selectedMinute} ${selectedPeriod}`,
    [selectedHour, selectedMinute, selectedPeriod]
  );

  const recurrenceDisplay = useMemo(() => {
    if (recurrence === "Custom Days" && customDays.length > 0) {
      return `Custom: ${customDays.join(", ")}`;
    }
    return recurrence;
  }, [recurrence, customDays]);

  const handleToggleCustomDay = (day: string) => {
    setCustomDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const handleSelectRecurrence = (option: string) => {
    setRecurrence(option);

    if (option === "Daily") {
      setCustomDays(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    } else if (option === "Weekdays") {
      setCustomDays(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    } else if (option === "As Needed") {
      setCustomDays([]);
    } else if (option === "Custom Days") {
      setShowCustomDaysModal(true);
    }
  };

  const handleTestBrowserNotification = async () => {
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

    if (permission === "granted") {
      try {
        new Notification("TabSafe test", {
          body: "If you can see this, browser notifications work.",
        });
        Alert.alert("Success", "Browser notification created.");
      } catch (err) {
        console.error("[test] Failed to create notification:", err);
        Alert.alert("Error", String(err));
      }
    } else {
      Alert.alert("Notifications blocked", "Browser notifications are not allowed.");
    }
  };

  const handleSaveSchedule = async () => {
    if (!timeString.trim() || !recurrence.trim()) {
      Alert.alert("Missing information", "Please choose a time and recurrence.");
      return;
    }

    if (recurrence === "Custom Days" && customDays.length === 0) {
      Alert.alert("Missing days", "Please choose at least one custom day.");
      return;
    }

    const settings = await getSettings();

    const finalRecurrence =
      recurrence === "Custom Days"
        ? `Custom Days: ${customDays.join(", ")}`
        : recurrence;

    const schedule: Schedule = {
      id: Date.now().toString(),
      medicationName: medication.name,
      time: timeString,
      recurrence: finalRecurrence,
      reminderLabel,
      enabled: true,
      notificationPrivacyMode:
        settings.notificationsMode === "generic" ? "private" : "detailed",
    };

    let notificationId = null;

    if (recurrence !== "As Needed") {
      notificationId =
        Platform.OS === "web" ? null : await scheduleDeviceReminder(schedule);
    }

    await addSchedule({
      ...schedule,
      notificationId: notificationId || undefined,
    });

    if (Platform.OS === "web" && recurrence !== "As Needed") {
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
        setReminderLabel("");
        setRecurrence("");
        setCustomDays([]);
        setSelectedHour("8");
        setSelectedMinute("00");
        setSelectedPeriod("AM");
        return;
      }

      Alert.alert("Error", "Could not schedule reminder.");
      return;
    }

    if (recurrence === "As Needed") {
      setSavedMessage("As-needed reminder saved without automatic notifications.");
    } else {
      setSavedMessage("Reminder saved successfully.");
    }

    setReminderLabel("");
    setRecurrence("");
    setCustomDays([]);
    setSelectedHour("8");
    setSelectedMinute("00");
    setSelectedPeriod("AM");
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Schedule Reminder</Text>
        <Text style={styles.subtitle}>
          Set a reminder for {medication.name}
        </Text>

        <Text style={styles.sectionLabel}>Choose a time</Text>
        <Pressable style={styles.timeTrigger} onPress={() => setShowTimeModal(true)}>
          <Text style={styles.timeTriggerLabel}>Reminder time</Text>
          <Text style={styles.timeTriggerValue}>{timeString}</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>Choose recurrence</Text>
        <View style={styles.optionRow}>
          {recurrenceOptions.map((option) => {
            const isActive = recurrence === option;
            return (
              <Pressable
                key={option}
                style={[
                  styles.optionChip,
                  isActive && styles.optionChipActive,
                ]}
                onPress={() => handleSelectRecurrence(option)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    isActive && styles.optionChipTextActive,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {recurrence === "As Needed" ? (
          <Text style={styles.helperText}>
            No automatic reminders will be scheduled. This option is for medications
            taken only when needed.
          </Text>
        ) : null}

        {recurrence ? (
          <View style={styles.selectionSummaryCard}>
            <Text style={styles.selectionSummaryLabel}>Selected recurrence</Text>
            <Text style={styles.selectionSummaryValue}>{recurrenceDisplay}</Text>
          </View>
        ) : null}

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

        {savedMessage ? (
          <Text style={styles.savedText}>{savedMessage}</Text>
        ) : null}

        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showTimeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.compactModalCard}>
            <Text style={styles.modalTitle}>Choose Time</Text>

            <View style={styles.compactWheelRow}>
              <View style={styles.compactWheelColumn}>
                <Text style={styles.wheelLabel}>Hour</Text>
                <ScrollView
                  style={styles.compactWheelList}
                  showsVerticalScrollIndicator={false}
                >
                  {HOURS.map((hour) => (
                    <Pressable
                      key={hour}
                      style={[
                        styles.wheelItem,
                        selectedHour === hour && styles.wheelItemActive,
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text
                        style={[
                          styles.wheelItemText,
                          selectedHour === hour && styles.wheelItemTextActive,
                        ]}
                      >
                        {hour}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.compactWheelColumn}>
                <Text style={styles.wheelLabel}>Min</Text>
                <ScrollView
                  style={styles.compactWheelList}
                  showsVerticalScrollIndicator={false}
                >
                  {MINUTES.map((minute) => (
                    <Pressable
                      key={minute}
                      style={[
                        styles.wheelItem,
                        selectedMinute === minute && styles.wheelItemActive,
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text
                        style={[
                          styles.wheelItemText,
                          selectedMinute === minute && styles.wheelItemTextActive,
                        ]}
                      >
                        {minute}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.periodColumnCompact}>
                <Text style={styles.wheelLabel}>AM / PM</Text>
                {(["AM", "PM"] as const).map((period) => (
                  <Pressable
                    key={period}
                    style={[
                      styles.wheelItem,
                      selectedPeriod === period && styles.wheelItemActive,
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text
                      style={[
                        styles.wheelItemText,
                        selectedPeriod === period && styles.wheelItemTextActive,
                      ]}
                    >
                      {period}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              style={styles.modalDoneButton}
              onPress={() => setShowTimeModal(false)}
            >
              <Text style={styles.modalDoneButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCustomDaysModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomDaysModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose Custom Days</Text>
            <Text style={styles.customDaysHint}>
              Select one or more days (e.g. Monday only = weekly)
            </Text>

            <View style={styles.daysGrid}>
              {DAY_OPTIONS.map((day) => {
                const isSelected = customDays.includes(day);
                return (
                  <Pressable
                    key={day}
                    style={[
                      styles.dayChip,
                      isSelected && styles.dayChipActive,
                    ]}
                    onPress={() => handleToggleCustomDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        isSelected && styles.dayChipTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={styles.modalDoneButton}
              onPress={() => setShowCustomDaysModal(false)}
            >
              <Text style={styles.modalDoneButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
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
    fontSize: 32,
    fontWeight: "700",
    color: "#1E3A5F",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#4A5568",
    marginBottom: 24,
    textAlign: "center",
  },
  sectionLabel: {
    width: "100%",
    fontSize: 15,
    fontWeight: "600",
    color: "#1E3A5F",
    marginBottom: 8,
    marginTop: 8,
  },
  timeTrigger: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  timeTriggerLabel: {
    fontSize: 13,
    color: "#718096",
    marginBottom: 4,
  },
  timeTriggerValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E3A5F",
  },
  optionRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  optionChip: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  optionChipActive: {
    backgroundColor: "#1E3A5F",
  },
  optionChipText: {
    color: "#1E3A5F",
    fontSize: 14,
    fontWeight: "600",
  },
  optionChipTextActive: {
    color: "#FFFFFF",
  },
  helperText: {
    width: "100%",
    fontSize: 13,
    color: "#718096",
    marginBottom: 12,
    lineHeight: 20,
  },
  selectionSummaryCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectionSummaryLabel: {
    fontSize: 13,
    color: "#718096",
    marginBottom: 6,
  },
  selectionSummaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E3A5F",
  },
  savedText: {
    color: "#2F855A",
    fontSize: 14,
    marginTop: 12,
    marginBottom: 8,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "center",
    padding: 24,
  },
  compactModalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    maxHeight: 420,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E3A5F",
    marginBottom: 16,
    textAlign: "center",
  },
  compactWheelRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  compactWheelColumn: {
    flex: 1,
  },
  wheelLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#718096",
    marginBottom: 8,
    textAlign: "center",
  },
  compactWheelList: {
    maxHeight: 180,
  },
  wheelItem: {
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  wheelItemActive: {
    backgroundColor: "#1E3A5F",
  },
  wheelItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E3A5F",
  },
  wheelItemTextActive: {
    color: "#FFFFFF",
  },
  periodColumnCompact: {
    width: 80,
    gap: 8,
  },
  customDaysHint: {
    fontSize: 12,
    color: "#718096",
    marginTop: -6,
    marginBottom: 14,
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  dayChip: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  dayChipActive: {
    backgroundColor: "#1E3A5F",
  },
  dayChipText: {
    color: "#1E3A5F",
    fontSize: 14,
    fontWeight: "600",
  },
  dayChipTextActive: {
    color: "#FFFFFF",
  },
  modalDoneButton: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "center",
  },
  modalDoneButtonText: {
    color: "#1E3A5F",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});