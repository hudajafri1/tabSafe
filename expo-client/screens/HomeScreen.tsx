import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import TopNavTabs from "../components/TopNavTabs";
import { Medication } from "../models/Medication";
import { Schedule } from "../models/Schedule";
import { getSettings } from "../logic/settingsLogic";

type HomeScreenProps = {
  onGoHome: () => void;
  onAddMedication: () => void;
  onViewHistory: () => void;
  onViewSettings: () => void;
  onDismissBanner: () => void;
  savedMeds: Medication[];
  upcomingReminder: Schedule | null;
};

export default function HomeScreen({
  onGoHome,
  onAddMedication,
  onViewHistory,
  onViewSettings,
  onDismissBanner,
  savedMeds,
  upcomingReminder,
}: HomeScreenProps) {
  const hasMedications = savedMeds.length > 0;

  const getMinutesUntil = (time: string): number | null => {
    const parts = time.trim().split(/\s+/);
    if (parts.length < 2) return null;

    const timePart = parts[0];
    const modifier = parts[1].toUpperCase();
    if (modifier !== "AM" && modifier !== "PM") return null;

    const [hhRaw, mmRaw] = timePart.split(":");
    const hours12 = Number(hhRaw);
    const minutes = Number(mmRaw);

    if (!Number.isFinite(hours12) || !Number.isFinite(minutes)) return null;
    if (hours12 < 1 || hours12 > 12) return null;
    if (minutes < 0 || minutes > 59) return null;

    let hours24 = hours12;
    if (modifier === "PM" && hours24 !== 12) hours24 += 12;
    if (modifier === "AM" && hours24 === 12) hours24 = 0;

    const now = new Date();
    const target = new Date(now);
    target.setHours(hours24, minutes, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    return Math.floor((target.getTime() - now.getTime()) / 60000);
  };

  const minutesUntil =
    upcomingReminder && upcomingReminder.enabled
      ? getMinutesUntil(upcomingReminder.time)
      : null;

  const showBanner =
    upcomingReminder &&
    upcomingReminder.enabled &&
    minutesUntil !== null &&
    minutesUntil >= 0 &&
    minutesUntil <= 60;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TabSafe</Text>
      <Text style={styles.subtitle}>
        Private medication tracking, stored locally on your device
      </Text>

      <TopNavTabs
        activeTab="home"
        onGoHome={onGoHome}
        onGoAdd={onAddMedication}
        onGoHistory={onViewHistory}
        onGoSettings={onViewSettings}
      />

      {showBanner ? (
        <View style={styles.bannerCard}>
          <View style={styles.bannerHeader}>
            <Text style={styles.bannerTitle}>
              {minutesUntil === 0
                ? "Almost time now"
                : minutesUntil === 60
                  ? "Almost time in 1 hour"
                  : `Almost time in ${minutesUntil} min`}
            </Text>

            <Pressable onPress={onDismissBanner}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </Pressable>
          </View>

          <Text style={styles.bannerText}>
            {upcomingReminder.reminderLabel &&
            upcomingReminder.reminderLabel.trim().length > 0
              ? upcomingReminder.reminderLabel
              : "Upcoming routine"}
          </Text>
        </View>
      ) : null}

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Privacy-First Dashboard</Text>
        <Text style={styles.heroText}>
          TabSafe keeps medication details off the home screen to reduce
          accidental exposure while still making reminders and navigation easy to
          access.
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Saved Medications</Text>
          <Text style={styles.summaryValue}>{savedMeds.length}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Privacy Mode</Text>
          <Text style={styles.summaryValue}>Private</Text>
          <Text style={styles.summarySubtext}>
            Medication details are hidden on the dashboard.
          </Text>
        </View>
      </View>

      {!hasMedications ? (
        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateTitle}>No medications added yet</Text>
          <Text style={styles.emptyStateText}>
            Start by adding your first medication. Details stay off the
            dashboard to reduce accidental exposure.
          </Text>
        </View>
      ) : null}

      <PrimaryButton title="Add Medication" onPress={onAddMedication} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 36,
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
    lineHeight: 22,
  },
  bannerCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  bannerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  dismissText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400E",
  },
  bannerText: {
    fontSize: 14,
    color: "#78350F",
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E3A5F",
    marginBottom: 8,
  },
  heroText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 22,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#718096",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E3A5F",
  },
  summarySubtext: {
    fontSize: 12,
    color: "#718096",
    marginTop: 6,
    lineHeight: 18,
  },
  emptyStateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3A5F",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 22,
  },
  privacyOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F7FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 100,
  },
  privacyOverlayTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E3A5F",
    marginBottom: 10,
    textAlign: "center",
  },
  privacyOverlayText: {
    fontSize: 15,
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18,
  },
  revealButton: {
    backgroundColor: "#1E3A5F",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  revealButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});