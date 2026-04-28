import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView, Switch } from "react-native";
import TopNavTabs from "../components/TopNavTabs";
import { AppSettings } from "../models/Settings";
import { getSettings, updateSettings } from "../logic/settingsLogic";
import PrimaryButton from "../components/PrimaryButton";

type SettingsScreenProps = {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
  onBack: () => void;
  onGoHome: () => void;
  onGoAdd: () => void;
  onGoHistory: () => void;
  onGoSettings: () => void;
  onLogout: () => void;
};

export default function SettingsScreen({
  isDark,
  setIsDark,
  onBack,
  onGoHome,
  onGoAdd,
  onGoHistory,
  onGoSettings,
  onLogout
}: SettingsScreenProps) {
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

  const handleToggleDarkMode = async () => {
    if (!settings) return;

    const updated = await updateSettings({
      darkModeEnabled: !settings.darkModeEnabled,
    });

    setSettings(updated);
    setIsDark(updated.darkModeEnabled ?? false);
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

  const handleTogglePrivacyAway = async () => {
    if (!settings) return;

    const updated = await updateSettings({
      privacyAwayEnabled: !settings.privacyAwayEnabled,
    });
    setSettings(updated);
  };

  if (!settings) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? "#111827" : "#F7FAFC" }]}>
        <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: isDark ? "#CBD5E1" : "#4A5568" }]}>Loading settings...</Text>
      </View>
    );
  }


  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? "#111827" : "#F7FAFC" },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>
        Settings
      </Text>

      <Text style={[styles.subtitle, { color: isDark ? "#CBD5E1" : "#4A5568" }]}>
        Privacy and security settings for TabSafe
      </Text>

      <TopNavTabs
        activeTab="settings"
        onGoHome={onGoHome}
        onGoAdd={onGoAdd}
        onGoHistory={onGoHistory}
        onGoSettings={onGoSettings}
      />

      <View style={[styles.card, { backgroundColor: isDark ? "#1F2937" : "#FFFFFF" }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>
          Appearance
        </Text>

        <View style={styles.toggleRow}>
          <Text style={[styles.sectionText, { color: isDark ? "#D1D5DB" : "#4A5568", marginBottom: 0 }]}>
            {isDark ? "Dark Mode" : "Light Mode"}
          </Text>

          <Switch
            value={settings.darkModeEnabled}
            onValueChange={handleToggleDarkMode}
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: isDark ? "#1F2937" : "#FFFFFF" }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Notification Privacy</Text>
        <Text style={[styles.sectionText, { color: isDark ? "#CBD5E1" : "#4A5568" }]}>
          Current mode:{" "}
          {settings.notificationsMode === "generic"
            ? "Generic reminders only"
            : "User-labeled reminders"}
        </Text>

        <Pressable
          style={[
            styles.optionButton,
            { backgroundColor: isDark ? "#334155" : "#DBEAFE" },
          ]}
          onPress={handleToggleNotificationMode}
        >
        {/*<Pressable style={styles.optionButton} onPress={handleToggleNotificationMode}>*/}
          <Text style={[styles.optionButtonText, { color: isDark ? "#FFFFFF" : "#1D4ED8" }]}>Toggle Notification Mode</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: isDark ? "#1F2937" : "#FFFFFF" }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Privacy Away Mode</Text>
        <Text style={[styles.sectionText, { color: isDark ? "#CBD5E1" : "#4A5568" }]}>
          {settings.privacyAwayEnabled
            ? "Enabled: TabSafe covers the screen when you return after leaving the browser tab."
            : "Disabled: TabSafe stays visible when you return to the browser tab."}
        </Text>

        <Pressable
          style={[
            styles.optionButton,
            { backgroundColor: isDark ? "#334155" : "#DBEAFE" },
          ]}
          onPress={handleTogglePrivacyAway}
        >
        {/*<Pressable style={styles.optionButton} onPress={handleTogglePrivacyAway}>*/}
          <Text style={[styles.optionButtonText, { color: isDark ? "#FFFFFF" : "#1D4ED8" }]}>Toggle Privacy Away Mode</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: isDark ? "#1F2937" : "#FFFFFF" }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Authentication</Text>
        <Text style={[styles.sectionText, { color: isDark ? "#CBD5E1" : "#4A5568" }]}>
          Biometrics: {settings.biometricEnabled ? "Enabled" : "Disabled"}
        </Text>

        <Pressable
          style={[
            styles.optionButton,
            { backgroundColor: isDark ? "#334155" : "#DBEAFE" },
          ]}
          onPress={handleToggleBiometric}
        >
        {/*<Pressable style={styles.optionButton} onPress={handleToggleBiometric}>*/}
          <Text style={[styles.optionButtonText, { color: isDark ? "#FFFFFF" : "#1D4ED8" }]}>Toggle Biometrics</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: isDark ? "#1F2937" : "#FFFFFF" }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>Backup</Text>
        <Text style={[styles.sectionText, { color: isDark ? "#CBD5E1" : "#4A5568" }]}>
          Backup mode: {settings.backupEnabled ? "Enabled" : "Disabled"}
        </Text>

        <Pressable
          style={[
            styles.optionButton,
            { backgroundColor: isDark ? "#334155" : "#DBEAFE" },
          ]}
          onPress={handleToggleBackup}
        >
        {/*<Pressable style={styles.optionButton} onPress={handleToggleBackup}>*/}
          <Text style={[styles.optionButtonText, { color: isDark ? "#FFFFFF" : "#1D4ED8" }]}>Toggle Backup</Text>
        </Pressable>
      </View>

      <View style={{ padding: 20, marginTop: 20 }}>
        <PrimaryButton 
          title="Log Out & Lock Account" 
          onPress={onLogout} 
          color="#C53030" 
        />
      </View>

      <Pressable
        style={[
          styles.secondaryButton,
          { backgroundColor: isDark ? "#334155" : "#E2E8F0" },
        ]}
        onPress={onBack}
      >
        <Text style={[styles.secondaryButtonText, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>
          Back
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F7FAFC",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
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
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});