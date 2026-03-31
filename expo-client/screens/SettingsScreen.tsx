import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { AppSettings } from "../models/Settings";
import { getSettings, updateSettings } from "../logic/settingsLogic";

type SettingsScreenProps = {
  onBack: () => void;
};

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const result = await getSettings();
      setSettings(result);
    };

    loadSettings();
  }, []);

  const handleToggleBiometric = async () => {
    if (!settings) return;

    const updated = await updateSettings({
      biometricEnabled: !settings.biometricEnabled,
    });
    setSettings(updated);
  };

  const handleToggleBackup = async () => {
    if (!settings) return;

    const updated = await updateSettings({
      backupEnabled: !settings.backupEnabled,
    });
    setSettings(updated);
  };

  const handleToggleNotificationMode = async () => {
    if (!settings) return;

    const updated = await updateSettings({
      notificationsMode:
        settings.notificationsMode === "generic"
          ? "user-labeled"
          : "generic",
    });
    setSettings(updated);
  };

  if (!settings) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>
        Privacy and security settings for TabSafe
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notification Privacy</Text>
        <Text style={styles.sectionText}>
          Current mode:{" "}
          {settings.notificationsMode === "generic"
            ? "Generic reminders only"
            : "User-labeled reminders"}
        </Text>

        <Pressable style={styles.optionButton} onPress={handleToggleNotificationMode}>
          <Text style={styles.optionButtonText}>Toggle Notification Mode</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Authentication</Text>
        <Text style={styles.sectionText}>
          Biometrics: {settings.biometricEnabled ? "Enabled" : "Disabled"}
        </Text>

        <Pressable style={styles.optionButton} onPress={handleToggleBiometric}>
          <Text style={styles.optionButtonText}>Toggle Biometrics</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Backup</Text>
        <Text style={styles.sectionText}>
          Backup mode: {settings.backupEnabled ? "Enabled" : "Disabled"}
        </Text>

        <Pressable style={styles.optionButton} onPress={handleToggleBackup}>
          <Text style={styles.optionButtonText}>Toggle Backup</Text>
        </Pressable>
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
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3A5F",
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: "#DBEAFE",
    paddingVertical: 12,
    borderRadius: 10,
  },
  optionButtonText: {
    textAlign: "center",
    color: "#1D4ED8",
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "#E2E8F0",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#1E3A5F",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});