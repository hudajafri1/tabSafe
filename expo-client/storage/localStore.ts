//localStore.ts
//
//saves and loads the vault to the device's local storage using encryption
//vault contains all medications, schedules, and settings
//uses encryption so data is never stored as plain text

//reference: https://medium.com/@thomas_40553/how-to-secure-encrypt-and-decrypt-data-within-the-browser-with-aes-gcm-and-pbkdf2-057b839c96b6
//this file calls encryptData and decryptData, directly inspired by this^

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Vault } from "../models/Vault";
import { encryptData, decryptData } from "../logic/storageEncryption";
import { getSessionPin } from "../logic/pinSession";

const VAULT_KEY = "tabsafe_vault";

//default empty vault -- used when no data exists yet or on error
const EMPTY_VAULT: Vault = {
  medications: [],
  schedules: [],
  intakeLogs: [],
  settings: {
    notificationsMode: "generic",
    biometricEnabled: false,
    backupEnabled: false,
    privacyAwayEnabled: true,
    darkModeEnabled: false,
  },
};

//encrypts the vault using the session PIN before saving to AsyncStorage
//if no PIN is in session (e.g. app somehow skipped unlock), skip saving 
export async function saveVault(vault: Vault): Promise<void> {
  try {
    const pin = getSessionPin();
    if (!pin) {
      console.error("No session PIN available, vault not saved");
      return;
    }
    const plaintext = JSON.stringify(vault);
    const encrypted = await encryptData(plaintext, pin);
    await AsyncStorage.setItem(VAULT_KEY, encrypted);
  } catch (error) {
    console.error("Error saving vault:", error);
  }
}

//loads and decrypts the vault using the session PIN
//if decryption fails (wrong PIN or corrupted data), return empty vault
export async function loadVault(): Promise<Vault> {
  try {
    const pin = getSessionPin();
    if (!pin) {
      console.error("No session PIN available, returning empty vault");
      return EMPTY_VAULT;
    }
    const encrypted = await AsyncStorage.getItem(VAULT_KEY);

    //no data saved yet --> first time launching the app
    if (!encrypted) return EMPTY_VAULT;

    const plaintext = await decryptData(encrypted, pin);
    const parsed = JSON.parse(plaintext);

    //merge with EMPTY_VAULT defaults in case new fields were added
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