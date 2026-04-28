import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import InputField from "../components/InputField";
import TopNavTabs from "../components/TopNavTabs";

type AddMedicationScreenProps = {
  isDark: boolean;
  onSave: (
    name: string,
    dosage: string,
    frequency: string,
    notes: string
  ) => void;
  onBack: () => void;
  onGoHome: () => void;
  onGoAdd: () => void;
  onGoHistory: () => void;
  onGoSettings: () => void;
};

export default function AddMedicationScreen({
  isDark,
  onSave,
  onBack,
  onGoHome,
  onGoAdd,
  onGoHistory,
  onGoSettings,
}: AddMedicationScreenProps) {
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!medicationName.trim() || !dosage.trim() || !frequency.trim()) return;

    onSave(medicationName, dosage, frequency, notes);
    setMedicationName("");
    setDosage("");
    setFrequency("");
    setNotes("");
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#111827" : "#F7FAFC" }]}>
      <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Add Medication</Text>
      <Text style={[styles.subtitle, { color: isDark ? "#CBD5E1" : "#4A5568" }]}>Enter medication details below.</Text>

      <TopNavTabs
        activeTab="add"
        onGoHome={onGoHome}
        onGoAdd={onGoAdd}
        onGoHistory={onGoHistory}
        onGoSettings={onGoSettings}
      />

      <InputField value={medicationName} onChangeText={setMedicationName} placeholder="Medication name" />
      <InputField value={dosage} onChangeText={setDosage} placeholder="Dosage" />
      <InputField value={frequency} onChangeText={setFrequency} placeholder="Frequency (e.g. Daily)" />
      <InputField value={notes} onChangeText={setNotes} placeholder="Notes (optional)" />

      <PrimaryButton title="Save Medication" onPress={handleSave} />

      <Pressable
        style={[styles.secondaryButton, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}
        onPress={onBack}
      >
        <Text style={[styles.secondaryButtonText, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  secondaryButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});