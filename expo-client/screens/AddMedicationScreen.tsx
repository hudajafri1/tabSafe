import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import InputField from "../components/InputField";

type AddMedicationScreenProps = {
  onSave: (
    name: string,
    dosage: string,
    frequency: string,
    notes: string
  ) => void;
  onBack: () => void;
};

export default function AddMedicationScreen({
  onSave,
  onBack,
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