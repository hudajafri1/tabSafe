import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Medication } from "../models/Medication";

type MedicationCardProps = {
  medication: Medication;
};

export default function MedicationCard({ medication }: MedicationCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{medication.name}</Text>
      <Text style={styles.detail}>{medication.dosage}</Text>
      <Text style={styles.detail}>{medication.frequency}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A5F",
  },
  detail: {
    fontSize: 14,
    color: "#4A5568",
    marginTop: 2,
  },
});