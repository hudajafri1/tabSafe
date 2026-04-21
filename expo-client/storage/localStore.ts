import AsyncStorage from "@react-native-async-storage/async-storage";
import { Vault } from "../models/Vault";

const VAULT_KEY = "tabsafe_vault";

const EMPTY_VAULT: Vault = {
  medications: [],
  schedules: [],
  intakeLogs: [],
  settings: {
    notificationsMode: "generic",
    biometricEnabled: false,
    backupEnabled: false,
    privacyAwayEnabled: true,
  },
};

export async function saveVault(vault: Vault): Promise<void> {
  try {
    const jsonValue = JSON.stringify(vault);
    await AsyncStorage.setItem(VAULT_KEY, jsonValue);
  } catch (error) {
    console.error("Error saving vault:", error);
  }
}

export async function loadVault(): Promise<Vault> {
  try {
    const jsonValue = await AsyncStorage.getItem(VAULT_KEY);

    if (!jsonValue) return EMPTY_VAULT;

    const parsed = JSON.parse(jsonValue);

    return {
      ...EMPTY_VAULT,
      ...parsed,
      settings: {
        ...EMPTY_VAULT.settings,
        ...(parsed.settings || {}),
      },
    };
  } catch (error) {
    console.error("Error loading vault:", error);
    return EMPTY_VAULT;
  }
}