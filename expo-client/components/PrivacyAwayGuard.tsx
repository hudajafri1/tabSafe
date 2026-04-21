import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import { getSettings } from "../logic/settingsLogic";

type PrivacyAwayGuardProps = {
  children: React.ReactNode;
};

export default function PrivacyAwayGuard({
  children,
}: PrivacyAwayGuardProps) {
  const [privacyAwayEnabled, setPrivacyAwayEnabled] = useState(true);
  const [showPrivacyCover, setShowPrivacyCover] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      setPrivacyAwayEnabled(settings.privacyAwayEnabled ?? true);
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!privacyAwayEnabled) return;

    const originalTitle = document.title;

    const coverNow = () => {
      setShowPrivacyCover(true);
      document.title = "TabSafe";
    };

    const handleBlur = () => {
      coverNow();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        coverNow();
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.title = originalTitle;
    };
  }, [privacyAwayEnabled]);

  const handleReveal = async () => {
    setShowPrivacyCover(false);

    if (Platform.OS === "web") {
      document.title = "TabSafe";
    }

    const settings = await getSettings();
    setPrivacyAwayEnabled(settings.privacyAwayEnabled ?? true);
  };

  return (
    <View style={styles.root}>
      {children}

      {showPrivacyCover ? (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>Privacy mode enabled</Text>
          <Text style={styles.overlayText}>
            TabSafe covered the screen after the browser tab lost focus.
          </Text>

          <Pressable style={styles.revealButton} onPress={handleReveal}>
            <Text style={styles.revealButtonText}>Reveal TabSafe</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F7FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 9999,
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E3A5F",
    marginBottom: 10,
    textAlign: "center",
  },
  overlayText: {
    fontSize: 15,
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18,
    maxWidth: 360,
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