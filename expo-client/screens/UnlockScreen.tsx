import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { getStoredPin, savePin, verifyPin, saveRecoveryConfig, verifyRecoveryAnswer } from "../logic/authLogic";
import { setSessionPin } from "../logic/pinSession";

type UnlockScreenProps = {
  onUnlock: () => void;
};

export default function UnlockScreen({ onUnlock }: UnlockScreenProps) {
  const [storedPinExists, setStoredPinExists] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [securityQuestion] = useState("What was the name of your first pet?");

  useEffect(() => {
    const checkPin = async () => {
      const existingPin = await getStoredPin();
      setStoredPinExists(!!existingPin);
    };

    checkPin();
  }, []);

  //if pin is forgotten, we WIPE ALL DATA --> privacy over everything 
  //pin recovery questions to be implemented soon 
  const handleResetVault = async () => {
    const message = "Resetting your PIN will permanently delete all your encrypted medication data to protect your privacy. " + 
    "Since we don't store your data on a server, this cannot be undone. " +
    "\n\nDo you want to clear the vault and create a new PIN?";
    
    //check if we are on web or mobile for the confirmation dialog
    const confirmed = window.confirm(message);

    if (confirmed) {
      try {
        await AsyncStorage.clear(); 
        setStoredPinExists(false);
        setPin("");
        setConfirmPin("");
        setError("");
        console.log("Vault wiped and PIN reset.");
      } catch (e) {
        setError("Failed to reset PIN and wipe vault.");
      }
    }
  };

  const handleCreatePin = async () => {
    if (!pin.trim() || !confirmPin.trim() || !recoveryAnswer.trim()) {
      setError("Please fill out both PIN fields and the recovery answer.");
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

    await saveRecoveryConfig(securityQuestion, recoveryAnswer);
    
    setError("");
    setSessionPin(pin);
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
    setSessionPin(pin);
    onUnlock();
  };

  const handleRecoveryUnlock = async () => {
    if (!recoveryAnswer.trim()) {
      setError("Please enter your answer.");
      return;
    }
    const valid = await verifyRecoveryAnswer(recoveryAnswer);
    if (valid) {
      setError("");
      // Use the answer as the temporary session key to unlock
      setSessionPin(recoveryAnswer.toLowerCase().trim());
      onUnlock();
    } else {
      setError("Incorrect recovery answer.");
    }
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

      <View style={styles.card}>
      {!storedPinExists ? (

        //case 1: initializing the pin 
        <>
          <Text style={styles.sectionTitle}>Create PIN</Text>
          <InputField value={pin} onChangeText={setPin} placeholder="Create PIN" secureTextEntry />
          <InputField value={confirmPin} onChangeText={setConfirmPin} placeholder="Confirm PIN" secureTextEntry />

          <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Recovery Question</Text>
          <Text style={styles.infoText}>{securityQuestion}</Text>
          <InputField value={recoveryAnswer} onChangeText={setRecoveryAnswer} placeholder="Your Answer" />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <PrimaryButton title="Save & Protect Vault" onPress={handleCreatePin} />
        </>
      ) : isRecoveryMode ? (
        //case 2: recovering the pin using questions 
        <>
          <Text style={styles.sectionTitle}>Account Recovery</Text>
          <Text style={styles.infoText}>{securityQuestion}</Text>
          <InputField value={recoveryAnswer} onChangeText={setRecoveryAnswer} placeholder="Enter Answer" />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <PrimaryButton title="Verify Answer" onPress={handleRecoveryUnlock} />

          <Pressable onPress={() => setIsRecoveryMode(false)} style={styles.resetLink}>
            <Text style={styles.resetText}>Back to PIN</Text>
          </Pressable>
        </>
      ) : (
        //case 3: just logging back in 
        <>
          <Text style={styles.sectionTitle}>Unlock Vault</Text>
          <InputField value={pin} onChangeText={setPin} placeholder="Enter PIN" secureTextEntry />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <PrimaryButton title="Unlock" onPress={handleUnlock} />

          <Pressable onPress={() => setIsRecoveryMode(true)} style={styles.resetLink}>
            <Text style={styles.resetText}>Forgot PIN? Answer Security Question</Text>
          </Pressable>

          <Pressable onPress={handleResetVault} style={styles.resetLink}>
            <Text style={[styles.resetText, { color: '#C53030', marginTop: 10 }]}>Reset PIN and Wipe Vault</Text>
          </Pressable>
        </>
      )}
      </View> 

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Privacy Note</Text>
        <Text style={styles.infoText}>
          This unlock screen reduces casual access to sensitive medication data. 
          If you forget both your PIN and security answer, your data will be permanently 
          inaccessible to protect your privacy.
        </Text>
      </View>
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
  resetLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  resetText: {
    color: '#718096', // Subtle gray
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});