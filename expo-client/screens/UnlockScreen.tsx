import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { getStoredPin, savePin, verifyPin } from "../logic/authLogic";

type UnlockScreenProps = {
  onUnlock: () => void;
};

export default function UnlockScreen({ onUnlock }: UnlockScreenProps) {
  const [storedPinExists, setStoredPinExists] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkPin = async () => {
      const existingPin = await getStoredPin();
      setStoredPinExists(!!existingPin);
    };

    checkPin();
  }, []);

  const handleCreatePin = async () => {
    if (!pin.trim() || !confirmPin.trim()) {
      setError("Please fill out both PIN fields.");
      return;
    }

    if (pin.length < 4) {
      setError("PIN must be at least 4 characters.");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }

    await savePin(pin);
    setError("");
    onUnlock();
  };

  const handleUnlock = async () => {
    if (!pin.trim()) {
      setError("Please enter your PIN.");
      return;
    }

    const valid = await verifyPin(pin);

    if (!valid) {
      setError("Incorrect PIN.");
      return;
    }

    setError("");
    onUnlock();
  };

  if (storedPinExists === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>TabSafe</Text>
        <Text style={styles.subtitle}>Loading security settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TabSafe</Text>
      <Text style={styles.subtitle}>
        {storedPinExists
          ? "Enter your PIN to unlock your medication vault."
          : "Create a PIN to protect your medication vault."}
      </Text>

      <View style={styles.card}>
        {storedPinExists ? (
          <>
            <Text style={styles.sectionTitle}>Unlock Vault</Text>

            <InputField
              value={pin}
              onChangeText={setPin}
              placeholder="Enter PIN"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <PrimaryButton title="Unlock" onPress={handleUnlock} />
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Create PIN</Text>

            <InputField
              value={pin}
              onChangeText={setPin}
              placeholder="Create PIN"
            />

            <InputField
              value={confirmPin}
              onChangeText={setConfirmPin}
              placeholder="Confirm PIN"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <PrimaryButton title="Save PIN" onPress={handleCreatePin} />
          </>
        )}
      </View>

      <Pressable style={styles.infoCard}>
        <Text style={styles.infoTitle}>Privacy Note</Text>
        <Text style={styles.infoText}>
          This unlock screen is meant to reduce casual access to sensitive
          medication information. A future version can replace this with stronger
          secure storage or biometric integration.
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    justifyContent: "center",
    padding: 24,
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E3A5F",
    marginBottom: 14,
  },
  errorText: {
    color: "#C53030",
    fontSize: 14,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A5F",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
  },
});