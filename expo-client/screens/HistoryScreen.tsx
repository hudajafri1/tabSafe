import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Medication } from "../models/Medication";
import MedicationCard from "../components/MedicationCard";

type HistoryScreenProps = {
  savedMeds: Medication[];
  onBack: () => void;
  onSelectMedication: (medication: Medication) => void;
};

export default function HistoryScreen({
  savedMeds,
  onBack,
  onSelectMedication,
}: HistoryScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medication History</Text>
      <Text style={styles.subtitle}>
        Starter list of saved medications
      </Text>

      <View style={styles.card}>
        {savedMeds.length === 0 ? (
          <Text style={styles.cardText}>No medications saved yet.</Text>
        ) : (
          savedMeds.map((med, index) => (
            <Pressable key={index} onPress={() => onSelectMedication(med)}>
              <MedicationCard medication={med} />
            </Pressable>
          ))
        )}
      </View>

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
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardText: {
    fontSize: 15,
    color: "#4A5568",
    lineHeight: 22,
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