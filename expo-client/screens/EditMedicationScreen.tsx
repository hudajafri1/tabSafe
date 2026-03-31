import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { Medication } from "../models/Medication";

type EditMedicationScreenProps = {
  medication: Medication;
  onSave: (
    originalMedication: Medication,
    updatedMedication: Medication
  ) => void;
  onBack: () => void;
};

export default function EditMedicationScreen({
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

    onSave(medication, {
      name,
      dosage,
      frequency,
      notes,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Medication</Text>
      <Text style={styles.subtitle}>
        Update medication details below.
      </Text>

      <InputField value={name} onChangeText={setName} placeholder="Medication name" />
      <InputField value={dosage} onChangeText={setDosage} placeholder="Dosage" />
      <InputField
        value={frequency}
        onChangeText={setFrequency}
        placeholder="Frequency"
      />
      <InputField value={notes} onChangeText={setNotes} placeholder="Notes" />

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