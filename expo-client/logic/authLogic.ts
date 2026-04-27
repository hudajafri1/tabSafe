//handles the secure storage and verification of user's pin and recovery questions/answers 
//one way hashing --> irreversible (raw pins and answers never stored, just the hashes )
//recovery answers are trimmed and lowercase to ensure reliability across user input tendencies 

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const PIN_KEY = "tabsafe_pin";
const RECOVERY_QUESTION_KEY = "recovery_question";
const RECOVERY_ANSWER_KEY = "recovery_answer_hash";

//helper function: hashes a string (pin or answer) using SHA256
//raw pin is never saved anywhere --> only the hash 
async function hashInput(input: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input
  );
}

//pin logic <3 
//retrieves stored pin hash from AsyncStorage 
//used internally to check if pin has been setup yet 
export async function getStoredPin(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PIN_KEY);
  } catch (error) {
    console.error("Error reading PIN:", error);
    return null;
  }
}

//hashes and saves pin to AsyncStorage
//called during pin setup and changes  
export async function savePin(pin: string): Promise<void> {
  try {
    const hashed = await hashInput(pin);
    await AsyncStorage.setItem(PIN_KEY, hashed);
  } catch (error) {
    console.error("Error saving PIN:", error);
  }
}

//verified a pin attempt by hashing the input and comparing stored hash 
//returns true if match
export async function verifyPin(inputPin: string): Promise<boolean> {
  try {
    const storedPin = await AsyncStorage.getItem(PIN_KEY);
    const hashedInput = await hashInput(inputPin);
    return storedPin === hashedInput;
  } catch (error) {
    console.error("Error verifying PIN:", error);
    return false;
  }
}

//recovery logic <3 for question + answer recovery section 
//normalize (lowercase and strip spaces) and hash the recovery answer before storage 
export async function saveRecoveryConfig(question: string, answer: string): Promise<void> {
  try {
    const normalizedAnswer = answer.toLowerCase().trim();
    const hashedAnswer = await hashInput(normalizedAnswer);
    
    await AsyncStorage.setItem(RECOVERY_QUESTION_KEY, question);
    await AsyncStorage.setItem(RECOVERY_ANSWER_KEY, hashedAnswer);
  } catch (error) {
    console.error("Error saving recovery config:", error);
  }
}

//verify a recovery attempt 
//if answer matches hash, permit entry even if the PIN is forgotten 
export async function verifyRecoveryAnswer(answer: string): Promise<boolean> {
  try {
    const storedHash = await AsyncStorage.getItem(RECOVERY_ANSWER_KEY);
    if (!storedHash) return false;

    const normalizedInput = answer.toLowerCase().trim();
    const hashedInput = await hashInput(normalizedInput);

    return storedHash === hashedInput;
  } catch (error) {
    console.error("Error verifying recovery answer:", error);
    return false;
  }
}