import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { Schedule } from "../models/Schedule";

type EditScheduleScreenProps = {
  isDark: boolean;
  schedule: Schedule;
  onSave: (scheduleId: string, updatedFields: Partial<Schedule>) => void;
  onBack: () => void;
};

const HOURS = ["1","2","3","4","5","6","7","8","9","10","11","12"];
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseTimeString(time: string) {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);

  if (!match) {
    return { hour: "8", minute: "00", period: "AM" as const };
  }

  return {
    hour: match[1],
    minute: match[2],
    period: match[3].toUpperCase() as "AM" | "PM",
  };
}

function parseRecurrenceString(recurrence: string) {
  if (recurrence.startsWith("Custom Days:")) {
    const daysPart = recurrence.replace("Custom Days:", "").trim();
    const days = daysPart ? daysPart.split(",").map((d) => d.trim()) : [];
    return {
      recurrenceType: "Custom Days",
      customDays: days,
    };
  }

  if (recurrence === "Daily") {
    return {
      recurrenceType: "Daily",
      customDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    };
  }

  if (recurrence === "Weekdays") {
    return {
      recurrenceType: "Weekdays",
      customDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    };
  }

  return {
    recurrenceType: "",
    customDays: [],
  };
}

export default function EditScheduleScreen({
  isDark,
  schedule,
  onSave,
  onBack,
}: EditScheduleScreenProps) {
  const parsedTime = parseTimeString(schedule.time);
  const parsedRecurrence = parseRecurrenceString(schedule.recurrence);

  const [selectedHour, setSelectedHour] = useState(parsedTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(parsedTime.minute);
  const [selectedPeriod, setSelectedPeriod] = useState(parsedTime.period);

  const [recurrence, setRecurrence] = useState(parsedRecurrence.recurrenceType);
  const [customDays, setCustomDays] = useState<string[]>(parsedRecurrence.customDays);
  const [reminderLabel, setReminderLabel] = useState(schedule.reminderLabel || "");

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
    } else if (option === "Custom Days") {
      setShowCustomDaysModal(true);
    }
  };

  const handleSave = () => {
    if (!timeString.trim() || !recurrence.trim()) {
      Alert.alert("Missing information", "Please choose a time and recurrence.");
      return;
    }

    if (recurrence === "Custom Days" && customDays.length === 0) {
      Alert.alert("Missing days", "Please choose at least one custom day.");
      return;
    }

    const finalRecurrence =
      recurrence === "Custom Days"
        ? `Custom Days: ${customDays.join(", ")}`
        : recurrence;

    onSave(schedule.id, {
      time: timeString,
      recurrence: finalRecurrence,
      reminderLabel,
    });
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: isDark ? "#111827" : "#F7FAFC" }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Edit Reminder</Text>
        <Text style={[styles.subtitle, { color: isDark ? "#CBD5E1" : "#4A5568" }]}>
          Update reminder details below.
        </Text>

        <Text style={[styles.sectionLabel, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Choose a time</Text>
        <Pressable style={[styles.timeTrigger, { backgroundColor: isDark ? "#1F2937" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]} onPress={() => setShowTimeModal(true)}>
          <Text style={[styles.timeTriggerLabel, { color: isDark ? "#CBD5E1" : "#718096" }]}>Reminder time</Text>
          <Text style={[styles.timeTriggerValue, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>{timeString}</Text>
        </Pressable>

        <Text style={[styles.sectionLabel, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Choose recurrence</Text>
        <View style={styles.optionRow}>
          {recurrenceOptions.map((option) => {
            const isActive = recurrence === option;
            return (
              <Pressable
                key={option}
                style={[
                  styles.optionChip,
                  { backgroundColor: isDark ? "#334155" : "#E2E8F0" },
                  isActive && styles.optionChipActive,
                ]}
                onPress={() => handleSelectRecurrence(option)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    { color: isDark ? "#FFFFFF" : "#1E3A5F" },
                    isActive && styles.optionChipTextActive,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {recurrence ? (
          <View style={[styles.selectionSummaryCard, { backgroundColor: isDark ? "#1F2937" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
            <Text style={[styles.selectionSummaryLabel, { color: isDark ? "#CBD5E1" : "#718096" }]}>Selected recurrence</Text>
            <Text style={[styles.selectionSummaryValue, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>{recurrenceDisplay}</Text>
          </View>
        ) : null}

        <InputField
          value={reminderLabel}
          onChangeText={setReminderLabel}
          placeholder="Custom label"
        />

        <PrimaryButton title="Save Changes" onPress={handleSave} />

        <Pressable style={[styles.secondaryButton, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} onPress={onBack}>
          <Text style={[styles.secondaryButtonText, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Back</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showTimeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.compactModalCard, { backgroundColor: isDark ? "#1F2937" : "#FFFFFF" }]}>
            <Text style={[styles.modalTitle, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Choose Time</Text>

            <View style={styles.compactWheelRow}>
              <View style={styles.compactWheelColumn}>
                <Text style={[styles.wheelLabel, { color: isDark ? "#CBD5E1" : "#718096" }]}>Hour</Text>
                <ScrollView
                  style={styles.compactWheelList}
                  showsVerticalScrollIndicator={false}
                >
                  {HOURS.map((hour) => (
                    <Pressable
                      key={hour}
                      style={[
                        styles.wheelItem,
                        { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
                        selectedHour === hour && styles.wheelItemActive,
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text
                        style={[
                          styles.wheelItemText,
                          { color: isDark ? "#FFFFFF" : "#1E3A5F" },
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
                <Text style={[styles.wheelLabel, { color: isDark ? "#CBD5E1" : "#718096" }]}>Min</Text>
                <ScrollView
                  style={styles.compactWheelList}
                  showsVerticalScrollIndicator={false}
                >
                  {MINUTES.map((minute) => (
                    <Pressable
                      key={minute}
                      style={[
                        styles.wheelItem,
                        { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
                        selectedMinute === minute && styles.wheelItemActive,
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text
                        style={[
                          styles.wheelItemText,
                          { color: isDark ? "#FFFFFF" : "#1E3A5F" },
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
                <Text style={[styles.wheelLabel, { color: isDark ? "#CBD5E1" : "#718096" }]}>AM / PM</Text>
                {(["AM", "PM"] as const).map((period) => (
                  <Pressable
                    key={period}
                    style={[
                      styles.wheelItem,
                      { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
                      selectedPeriod === period && styles.wheelItemActive,
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text
                      style={[
                        styles.wheelItemText,
                        { color: isDark ? "#FFFFFF" : "#1E3A5F" },
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
              style={[styles.modalDoneButton, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}
              onPress={() => setShowTimeModal(false)}
            >
              <Text style={[styles.modalDoneButtonText, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Done</Text>
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
          <View style={[styles.modalCard, { backgroundColor: isDark ? "#1F2937" : "#FFFFFF" }]}>
            <Text style={[styles.modalTitle, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Choose Custom Days</Text>
            <Text style={{ fontSize: 12, color: isDark ? "#CBD5E1" : "#718096", marginTop: -6, marginBottom: 14, textAlign: "center",}}>
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
                      { backgroundColor: isDark ? "#334155" : "#E2E8F0" },
                      isSelected && styles.dayChipActive,
                    ]}
                    onPress={() => handleToggleCustomDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        { color: isDark ? "#FFFFFF" : "#1E3A5F" },
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
              style={[styles.modalDoneButton, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}
              onPress={() => setShowCustomDaysModal(false)}
            >
              <Text style={[styles.modalDoneButtonText, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Done</Text>
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