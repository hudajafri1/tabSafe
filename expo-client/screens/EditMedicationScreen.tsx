import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { Medication } from "../models/Medication";

type EditMedicationScreenProps = {
  isDark: boolean;
  medication: Medication;
  onSave: (
    originalMedication: Medication,
    updatedMedication: Medication
  ) => void;
  onBack: () => void;
};

export default function EditMedicationScreen({
  isDark,
  medication,
  onSave,
  onBack,
}: EditMedicationScreenProps) {
  const [name, setName] = useState(medication.name);
  const [dosage, setDosage] = useState(medication.dosage);
  const [frequency, setFrequency] = useState(medication.frequency);
  const [notes, setNotes] = useState(medication.notes || "");

  const handleSave = () => {
    if (!name.trim() || !dosage.trim() || !frequency.trim()) return;

    onSave(medication, { name, dosage, frequency, notes });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#111827" : "#F7FAFC" }]}>
      <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Edit Medication</Text>
      <Text style={[styles.subtitle, { color: isDark ? "#CBD5E1" : "#4A5568" }]}>Update medication details below.</Text>

      <InputField value={name} onChangeText={setName} placeholder="Medication name" />
      <InputField value={dosage} onChangeText={setDosage} placeholder="Dosage" />
      <InputField value={frequency} onChangeText={setFrequency} placeholder="Frequency" />
      <InputField value={notes} onChangeText={setNotes} placeholder="Notes" />

      <PrimaryButton title="Save Changes" onPress={handleSave} />

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
    justifyContent: "center",
    padding: 24,
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
