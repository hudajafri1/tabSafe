import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import InputField from "../components/InputField";
import TopNavTabs from "../components/TopNavTabs";

type AddMedicationScreenProps = {
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
    <View style={styles.container}>
      <Text style={styles.title}>Add Medication</Text>
      <Text style={styles.subtitle}>
        Enter medication details below.
      </Text>

      <TopNavTabs
        activeTab="add"
        onGoHome={onGoHome}
        onGoAdd={onGoAdd}
        onGoHistory={onGoHistory}
        onGoSettings={onGoSettings}
      />

      <InputField
        value={medicationName}
        onChangeText={setMedicationName}
        placeholder="Medication name"
      />

      <InputField
        value={dosage}
        onChangeText={setDosage}
        placeholder="Dosage"
      />

      <InputField
        value={frequency}
        onChangeText={setFrequency}
        placeholder="Frequency (e.g. Daily)"
      />

      <InputField
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes (optional)"
      />

      <PrimaryButton title="Save Medication" onPress={handleSave} />

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