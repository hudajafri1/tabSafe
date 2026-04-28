import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import TopNavTabs from "../components/TopNavTabs";
import { Medication } from "../models/Medication";
import MedicationCard from "../components/MedicationCard";

type HistoryScreenProps = {
  isDark: boolean;
  savedMeds: Medication[];
  onBack: () => void;
  onGoHome: () => void;
  onGoAdd: () => void;
  onGoHistory: () => void;
  onGoSettings: () => void;
  onSelectMedication: (medication: Medication) => void;
};

export default function HistoryScreen({
  isDark,
  savedMeds,
  onBack,
  onGoHome,
  onGoAdd,
  onGoHistory,
  onGoSettings,
  onSelectMedication,
}: HistoryScreenProps) {

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: isDark ? "#111827" : "#F7FAFC" }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Medication History</Text>
      <Text style={[styles.subtitle, { color: isDark ? "#CBD5E1" : "#4A5568" }]}>Starter list of saved medications</Text>

      <TopNavTabs
        activeTab="history"
        onGoHome={onGoHome}
        onGoAdd={onGoAdd}
        onGoHistory={onGoHistory}
        onGoSettings={onGoSettings}
      />

      <View style={[styles.card, { backgroundColor: isDark ? "#1F2937" : "#FFFFFF" }]}>
        {savedMeds.length === 0 ? (
          <Text style={[styles.cardText, { color: isDark ? "#CBD5E1" : "#4A5568" }]}>No medications saved yet.</Text>
        ) : (
          savedMeds.map((med, index) => (
            <Pressable key={index} onPress={() => onSelectMedication(med)}>
              <MedicationCard medication={med} />
            </Pressable>
          ))
        )}
      </View>

      <Pressable
        style={[styles.secondaryButton, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}
        onPress={onBack}
      >
        <Text style={[styles.secondaryButtonText, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: { fontSize: 32, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: "center" },
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardText: { fontSize: 15, lineHeight: 22 },
  secondaryButton: { width: "100%", paddingVertical: 14, borderRadius: 12, marginTop: 12 },
  secondaryButtonText: { textAlign: "center", fontSize: 16, fontWeight: "600" },
});