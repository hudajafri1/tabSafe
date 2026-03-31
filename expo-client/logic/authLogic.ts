import AsyncStorage from "@react-native-async-storage/async-storage";

const PIN_KEY = "tabsafe_pin";

export async function getStoredPin(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PIN_KEY);
  } catch (error) {
    console.error("Error reading PIN:", error);
    return null;
  }
}

export async function savePin(pin: string): Promise<void> {
  try {
    await AsyncStorage.setItem(PIN_KEY, pin);
  } catch (error) {
    console.error("Error saving PIN:", error);
  }
}

export async function verifyPin(inputPin: string): Promise<boolean> {
  try {
    const storedPin = await AsyncStorage.getItem(PIN_KEY);
    return storedPin === inputPin;
  } catch (error) {
    console.error("Error verifying PIN:", error);
    return false;
  }
}