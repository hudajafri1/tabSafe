import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

type TopNavTabsProps = {
  activeTab: "home" | "add" | "history" | "settings";
  onGoHome: () => void;
  onGoAdd: () => void;
  onGoHistory: () => void;
  onGoSettings: () => void;
};

export default function TopNavTabs({
  activeTab,
  onGoHome,
  onGoAdd,
  onGoHistory,
  onGoSettings,
}: TopNavTabsProps) {
  return (
    <View style={styles.topTabs}>
      <Pressable
        style={[styles.tabButton, activeTab === "home" && styles.activeTab]}
        onPress={onGoHome}
      >
        <Text
          style={[styles.tabText, activeTab === "home" && styles.activeTabText]}
        >
          Home
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tabButton, activeTab === "add" && styles.activeTab]}
        onPress={onGoAdd}
      >
        <Text
          style={[styles.tabText, activeTab === "add" && styles.activeTabText]}
        >
          Add
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tabButton, activeTab === "history" && styles.activeTab]}
        onPress={onGoHistory}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "history" && styles.activeTabText,
          ]}
        >
          History
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tabButton, activeTab === "settings" && styles.activeTab]}
        onPress={onGoSettings}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "settings" && styles.activeTabText,
          ]}
        >
          Settings
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  topTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#E6F0FA",
    borderRadius: 14,
    padding: 6,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#1E3A5F",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E3A5F",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
});